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
    <div className="min-h-screen w-full bg-transparent">
      <Header />

      {/* 3 COLUMNS - OUTSIDE / INSIDE SPLIT */}
      <div className="max-w- mx-auto px-3 py-4 grid grid-cols-1 xl:grid-cols-[340px_1fr_380px] gap-4 items-start">

        {/* LEFT - OUTSIDE THE TRANSPARENT BOX, ON THE HEARTS */}
        <aside className="space-y-4 hidden xl:block sticky top-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-sm text-black">📌 PINNED ALERT</p><p className="text-sm mt-2 text-black">No emergencies in {zip}</p></div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-sm text-black">🚨 Emergency</p><p className="text-sm text-black mt-1">All clear</p></div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-sm text-black">Latest Alerts</p><p className="text-sm text-black mt-2">• Power check King Rd<br/>• Road work Tully</p></div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-sm text-black">What's Happening Near You</p><p className="text-xs text-black mt-2">Within 10-20 miles of {zip}</p></div>
        </aside>

        {/* CENTER - THIS IS THE TRANSPARENT BOX - ONLY FEED INSIDE */}
        <main className="bg-black/40 backdrop-blur-xl rounded- border border-white/20 p-4 shadow-2xl min-h-">
          {/* NEAR bar lives inside the feed box at top */}
          <div className="bg-white/90 rounded-full p-2 flex items-center gap-2 shadow border-2 border-black mb-4">
            <span className="font-black text-black text-sm pl-3">NEAR:</span>
            <input value={zip} onChange={e=>setZip(e.target.value)} className="border-2 border-black rounded-full px-3 py-1 font-black text-sm w-20 text-black" />
            <select className="border-2 border-black rounded-full px-3 py-1 font-black text-sm bg-white text-black"><option>10 miles</option><option>20 miles</option></select>
            <span className="ml-auto pr-3 text- font-black text-black hidden md:block">San Jose, CA • {zip}</span>
          </div>

          <div className="bg-black text-white rounded-full p-2.5 text-center font-black text-xs mb-4">🔴 LIVE NOW: 3 people talking within 10 miles</div>

          <div className="bg-white rounded-2xl p-4 shadow-2xl border-2 border-black mb-6">
            <MicRecorder value={draft} onChange={setDraft} />
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map(t=><button key={t} onClick={()=>setTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${tag===t?'bg-black text-white':'bg-white text-black border-black'}`}>{t}</button>)}
            </div>
            <button onClick={submit} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>

          {/* ONLY NEIGHBOR MESSAGES IN HERE - CONTINUOUS */}
          <div className="space-y-4">
            {posts.map(p=>(
              <div key={p.id} className="bg-white rounded-2xl p-5 shadow-xl border-2 border-black">
                <div className="flex justify-between mb-2"><span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full">{p.tag}</span><span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span></div>
                <p className="text-black text- whitespace-pre-wrap leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT - OUTSIDE THE TRANSPARENT BOX, ON THE HEARTS */}
        <aside className="space-y-4 hidden xl:block sticky top-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-black">Marketplace</p><p className="text-xs text-black mt-1">Free stuff near {zip}</p></div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-black">Business Directory</p><p className="text-xs text-black mt-1">Shops within 20 miles</p></div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-black">Upcoming Events</p><p className="text-xs text-black mt-1">This weekend near you</p></div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-2xl border-2 border-black"><p className="font-black text-black">Verified Sources</p><p className="text-xs text-black mt-1">City of San Jose, SJPD</p></div>
        </aside>

      </div>
    </div>
  )
}
