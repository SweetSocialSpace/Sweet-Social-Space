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
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(50)
    if(data) setPosts(data)
  })() }, [])

  const submit = async ()=>{
    if(!draft.trim()) return
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    await supabase.from('posts').insert({ user_id:user.id, body:draft, tag })
    setDraft('')
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(50)
    if(data) setPosts(data)
  }

  return (
    <div className="min-h-screen w-full bg-[#0f172a]">
      <Header />

      {/* YOUR 10-20 MILE IDEA - TOP BAR */}
      <div className="max-w- mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow">
          <span className="font-black text-black text-sm">NEAR:</span>
          <input value={zip} onChange={e=>setZip(e.target.value)} className="border-2 border-black rounded-full px-4 py-1.5 font-black text-sm w-24" />
          <select className="border-2 border-black rounded-full px-4 py-1.5 font-black text-sm bg-white">
            <option>10 miles</option><option>20 miles</option><option>5 miles</option>
          </select>
          <span className="ml-auto text-xs font-black text-gray-600">San Jose, CA • Showing what's happening near you</span>
        </div>
      </div>

      <div className="max-w- mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[320px_1fr_360px] gap-4">

        {/* LEFT COLUMN */}
        <aside className="space-y-4 order-2 lg:order-1">
          <div className="bg-yellow-100 border-2 border-black rounded-2xl p-4"><p className="font-black text-xs">📌 PINNED ALERT</p><p className="text-sm mt-1 text-black">No emergencies right now in {zip}</p></div>
          <div className="bg-red-50 border-2 border-black rounded-2xl p-4"><p className="font-black text-sm text-red-700">🚨 Emergency Alerts</p><p className="text-sm text-black mt-2">All clear</p></div>
          <div className="bg-white border-2 border-black rounded-2xl p-4"><p className="font-black text-sm text-black">Latest Alerts</p><div className="mt-2 space-y-2 text-sm text-black"><p>• Power check near King Rd</p><p>• Road work on Tully</p></div></div>
          <div className="bg-white border-2 border-black rounded-2xl p-4"><p className="font-black text-sm text-black">What's Happening Near You</p><p className="text-xs text-gray-600 mt-2">Posts within 10-20 miles of {zip}</p></div>
        </aside>

        {/* CENTER COLUMN - FEED */}
        <main className="space-y-4 order-1 lg:order-2">
          <div className="bg-white rounded-2xl p-3 border-2 border-black shadow"><p className="font-black text-xs text-black">🔴 LIVE NOW: 3 people talking within 10 miles</p></div>

          <div className="bg-white rounded-2xl p-5 shadow-xl border-2 border-black">
            <MicRecorder value={draft} onChange={setDraft} />
            <div className="mt-4 flex flex-wrap gap-2">
              {TAGS.map(t=><button key={t} onClick={()=>setTag(t)} className={`px-4 py-2 rounded-full text-sm font-black border-2 ${tag===t?'bg-black text-white border-black':'bg-white text-black border-black'}`}>{t}</button>)}
            </div>
            <button onClick={submit} className="mt-4 w-full bg-blue-600 text-white font-black py-3.5 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>

          <div className="space-y-3">
            {posts.map(p=>(
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow border-2 border-black">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full">{p.tag||'General'}</span>
                  <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span>
                </div>
                <p className="text-black text- whitespace-pre-wrap leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT COLUMN */}
        <aside className="space-y-4 order-3">
          <div className="bg-white border-2 border-black rounded-2xl p-4"><p className="font-black text-sm text-black">Marketplace</p><p className="text-xs text-gray-600 mt-2">Free stuff near {zip}</p></div>
          <div className="bg-white border-2 border-black rounded-2xl p-4"><p className="font-black text-sm text-black">Business Directory</p><p className="text-xs text-gray-600 mt-2">Shops within 20 miles</p></div>
          <div className="bg-white border-2 border-black rounded-2xl p-4"><p className="font-black text-sm text-black">Upcoming Events</p><p className="text-xs text-gray-600 mt-2">This weekend near you</p></div>
          <div className="bg-white border-2 border-black rounded-2xl p-4"><p className="font-black text-sm text-black">Verified Sources</p><p className="text-xs text-gray-600 mt-2">City of San Jose, SJPD</p></div>
        </aside>
      </div>
    </div>
  )
}
