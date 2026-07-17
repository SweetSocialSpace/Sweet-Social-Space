'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

export default function FeedPage() {
  const supabase = createClient()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('95122')

  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
    if(data) setPosts(data)
  })() }, [])

  const submit = async ()=>{
    if(!draft.trim()) return
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    await supabase.from('posts').insert({ user_id:user.id, body:draft, tag })
    setDraft('')
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
    if(data) setPosts(data)
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[360px_1fr_380px] gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">📌 PINNED ALERT</p><p className="text-sm mt-2 text-white/80">No emergencies in {zip}</p></div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🚨 Emergency</p><p className="text-sm text-white/80">All clear</p></div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">Latest Alerts</p><p className="text-sm mt-2 text-white/80">• Power check King Rd<br/>• Road work Tully</p></div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">What's Happening Near You</p><p className="text-xs mt-2 text-white/60">Within 10-20 miles of {zip}</p></div>
        </div>

        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-5">
          <div className="bg-white rounded-full p-2 flex items-center gap-2 mb-4">
            <span className="font-black text-black text-sm pl-3">NEAR:</span>
            <input value={zip} onChange={e=>setZip(e.target.value)} className="border-2 border-black rounded-full px-3 py-1 font-black text-sm w-20 bg-white text-black" />
            <select className="border-2 border-black rounded-full px-3 py-1 font-black text-sm bg-white text-black"><option>10 miles</option><option>20 miles</option></select>
            <span className="ml-auto pr-3 text-xs font-black text-black">San Jose, CA • {zip}</span>
          </div>
          <div className="bg-black text-white rounded-full py-2.5 text-center font-black text-xs mb-5">🔴 LIVE NOW: 3 people talking within 10 miles</div>
          <div className="bg-white rounded-2xl p-5 mb-6">
            {/* ONE MIC ONLY - simple textarea */}
            <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Tap mic and talk — I keep everything, even when you pause..." className="w-full min-h- text-black p-3 border rounded-xl" />
            <div className="mt-3 flex flex-wrap gap-2">{TAGS.map(t=><button key={t} onClick={()=>setTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${tag===t?'bg-black text-white':'bg-white text-black border-black'}`}>{t}</button>)}</div>
            <button onClick={submit} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>
          <div className="space-y-4">{posts.map(p=>(
            <div key={p.id} className="bg-white rounded-2xl p-5"><p className="text-black whitespace-pre-wrap">{p.body}</p></div>
          ))}</div>
        </div>

        <div className="space-y-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">Marketplace</p><p className="text-xs mt-1 text-white/60">Free stuff near {zip}</p></div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">Business Directory</p><p className="text-xs mt-1 text-white/60">Shops within 20 miles</p></div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">Upcoming Events</p><p className="text-xs mt-1 text-white/60">This weekend near you</p></div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">Verified Sources</p><p className="text-xs mt-1 text-white/60">City of San Jose, SJPD</p></div>
        </div>
      </div>
    </>
  )
}
