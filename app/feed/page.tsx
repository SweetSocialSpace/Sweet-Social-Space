'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'
import MicRecorder from '@/components/mic/MicRecorder'

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
    <div className="min-h-screen w-full">
      <Header />

      {/* TOP BAR - FULL WIDTH, OUTSIDE EVERYTHING */}
      <div className="max-w- mx-auto px-4 pt-4">
        <div className="bg-white rounded-full p-2 flex items-center gap-3 shadow-xl border-2 border-black">
          <span className="font-black text-black text-sm pl-3">NEAR:</span>
          <input value={zip} onChange={e=>setZip(e.target.value)} className="border-2 border-black rounded-full px-4 py-1.5 font-black text-sm w-24" />
          <select className="border-2 border-black rounded-full px-4 py-1.5 font-black text-sm bg-white text-black">
            <option>10 miles</option><option>20 miles</option>
          </select>
          <span className="ml-auto pr-4 text-xs font-black text-black">San Jose, CA • Showing what's happening near you</span>
        </div>
      </div>

      {/* 3 COLUMNS - NO BIG BOX AROUND THEM */}
      <div className="max-w- mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr_360px] gap-6 items-start">

        {/* LEFT - OUTSIDE, ITS OWN TABS */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-sm text-black">📌 PINNED ALERT</p><p className="text-sm mt-2 text-black">No emergencies in {zip}</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-sm text-black">🚨 Emergency</p><p className="text-sm text-black mt-1">All clear</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-sm text-black">Latest Alerts</p><p className="text-sm text-black mt-2">• Power check King Rd<br/>• Road work Tully</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-sm text-black">What's Happening Near You</p><p className="text-xs text-black mt-2">Within 10-20 miles of {zip}</p></div>
        </aside>

        {/* CENTER - WIDE OPEN FOR NEIGHBOR POSTS ONLY */}
        <main className="space-y-4">
          <div className="bg-black text-white rounded-full p-3 text-center font-black text-xs shadow-xl">🔴 LIVE NOW: 3 people talking within 10 miles</div>

          <div className="bg-white rounded-2xl p-5 shadow-2xl border-2 border-black">
            <MicRecorder value={draft} onChange={setDraft} />
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map(t=><button key={t} onClick={()=>setTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${tag===t?'bg-black text-white':'bg-white text-black border-black'}`}>{t}</button>)}
            </div>
            <button onClick={submit} className="mt-4 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>

          {/* THIS IS NOW FULL WIDTH FOR MESSAGES */}
          <div className="space-y-4">
            {posts.map(p=>(
              <div key={p.id} className="bg-white rounded-2xl p-5 shadow-xl border-2 border-black">
                <div className="flex justify-between mb-2"><span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full">{p.tag}</span><span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span></div>
                <p className="text-black text- whitespace-pre-wrap leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT - OUTSIDE, ITS OWN TABS */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-black">Marketplace</p><p className="text-xs text-black mt-1">Free stuff near {zip}</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-black">Business Directory</p><p className="text-xs text-black mt-1">Shops within 20 miles</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-black">Upcoming Events</p><p className="text-xs text-black mt-1">This weekend near you</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-black"><p className="font-black text-black">Verified Sources</p><p className="text-xs text-black mt-1">City of San Jose, SJPD</p></div>
        </aside>

      </div>
    </div>
  )
}
