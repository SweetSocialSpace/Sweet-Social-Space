'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import MicRecorder from '@/components/mic/MicRecorder'
import LocationScopeBar from '@/components/LocationScopeBar'
import LiveNowStrip from '@/components/LiveNowStrip'
import { smartPunctuate } from '@/components/mic/smartPunctuate'

const TAGS = ["General","Alert","Recommendation","Free stuff","Hot take","Lost & found"] as const

export default function FeedCenter() {
  const supabase = createClient()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<typeof TAGS[number]>('General')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('95122')
  const [radius, setRadius] = useState(10)
  const [isPosting, setIsPosting] = useState(false)

  const draftRef = useRef(draft)
  useEffect(()=>{ draftRef.current = draft }, [draft])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
    if(data) setPosts(data)
  }

  useEffect(()=>{ load() }, [])

  const submit = async ()=>{
    // STOP MIC like you asked
    ;(window as any).__stopMic?.()
    if(!draft.trim() || isPosting) return
    setIsPosting(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if(!user) return
      await supabase.from('posts').insert({ user_id:user.id, body:draft.trim(), tag })
      setDraft('')
      await load()
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* TOP - This gives you NEAR: 95122 / Use my location / GO LIVE like Picture 1 */}
      <LocationScopeBar zip={zip} radius={radius} setRadius={setRadius} />
      <LiveNowStrip />

      {/* COMPOSER - This is EXACTLY Picture 1 white card */}
      <div className="bg-white rounded-2xl p-5 shadow">
        <textarea
          value={draft}
          onChange={e=>setDraft(e.target.value)}
          placeholder=""
          className="w-full min-h- resize-none rounded-xl border border-gray-200 p-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/10"
        />
        <div className="mt-3 flex items-center justify-between">
          <MicRecorder value={draft} onChange={setDraft} />
          <button
            onClick={()=>setDraft(smartPunctuate(draft))}
            className="rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white"
          >
            ✨ Fix punctuation
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TAGS.map(t=>(
            <button
              key={t}
              onClick={()=>setTag(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-black border-2 transition ${tag===t?'bg-black text-white border-black':'bg-white text-black border-black hover:bg-gray-100'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!draft.trim() || isPosting}
          className="mt-4 w-full bg-blue-600 text-white font-black py-3 rounded-full disabled:opacity-50"
        >
          {isPosting? 'POSTING...' : `POST AS ${tag.toUpperCase()}`}
        </button>
      </div>

      {/* FEED - posts below */}
      <div className="space-y-4">
        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded-2xl p-5">
            <p className="text-black whitespace-pre-wrap text-sm">{p.body}</p>
            <div className="mt-2 text- font-black text-black/50">#{p.tag}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
