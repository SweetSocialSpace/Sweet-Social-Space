'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import MicRecorder from '@/components/mic/MicRecorder'
import LocationScopeBar from '@/components/LocationScopeBar'
import LiveNowStrip from '@/components/LiveNowStrip'

export default function FeedCenter() {
  const supabase = createClient()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState('General')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('95122')
  const [radius, setRadius] = useState(10)

  useEffect(()=>{
    (async()=>{
      const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
      if(data) setPosts(data)
    })()
  }, [])

  const submit = async ()=>{
    if(!draft.trim()) return
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    await supabase.from('posts').insert({ user_id:user.id, body:draft, tag })
    setDraft('')
    // reload posts
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
    if(data) setPosts(data)
  }

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-5">
      <LocationScopeBar zip={zip} radius={radius} setRadius={setRadius} />
      <LiveNowStrip />

      <div className="bg-white rounded-2xl p-5 mt-4 mb-6">
        <MicRecorder value={draft} onChange={setDraft} />
        <div className="mt-3 flex flex-wrap gap-2">
          {["General","Alert","Recommendation","Free stuff","Hot take","Lost & found"].map(t=>(
            <button key={t} onClick={()=>setTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${tag===t?'bg-black text-white':'bg-white text-black border-black'}`}>{t}</button>
          ))}
        </div>
        <button onClick={submit} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
      </div>

      <div className="space-y-4">
        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded-2xl p-5">
            <p className="text-black whitespace-pre-wrap">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
