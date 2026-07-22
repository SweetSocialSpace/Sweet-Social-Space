'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import MicRecorder from '@/components/mic/MicRecorder'
import LocationScopeBar from '@/components/LocationScopeBar'
import LiveNowStrip from '@/components/LiveNowStrip'
import { smartPunctuate } from '@/components/mic/smartPunctuate'

const TAGS = ["General","Alert","Recommendation","Free stuff","Hot take","Lost & found"] as const

export default function FeedCenter() {
  const supabase = createClient()
  const { zip: userZip } = useLocation()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<typeof TAGS[number]>('General')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('') // GLOBAL FIX: no hardcoded 95122
  const [radius, setRadius] = useState(10)
  const [isPosting, setIsPosting] = useState(false)

  // Sync with global location when it loads
  useEffect(() => {
    if (userZip &&!zip) setZip(userZip)
  }, [userZip])

  const load = async () => {
    if (!zip) return
    const { data } = await supabase
     .from('posts')
     .select('*')
     .eq('zip_code', zip) // GLOBAL FIX: filter by real zip
     .order('created_at',{ascending:false})
     .limit(100)
    if(data) setPosts(data)
  }
  useEffect(()=>{ if (zip) load() }, [zip])

  const submit = async ()=>{
    ;(window as any).__stopMic?.()
    if(!draft.trim() || isPosting ||!zip) return
    setIsPosting(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if(!user) return
      await supabase.from('posts').insert({
        user_id: user.id,
        body: draft.trim(),
        tag,
        zip_code: zip // GLOBAL FIX: save real zip, not hardcoded
      })
      setDraft('')
      await load()
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="space-y-4">
      <LocationScopeBar zip={zip} radius={radius} setRadius={setRadius} />
      <LiveNowStrip />

      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <textarea
          value={draft}
          onChange={e=>setDraft(e.target.value)}
          onFocus={()=> (window as any).__stopMic?.()}
          placeholder={zip? `What's happening in ${zip}?` : "Loading location..."}
          className="w-full min-h-40 resize-none rounded-xl border border-gray-200 p-4 text-sm text-black outline-none focus:ring-2 focus:ring-black/10"
        />
        <div className="mt-4 flex items-center justify-between">
          <MicRecorder onTranscript={setDraft} />
          <button onClick={()=> setDraft(smartPunctuate(draft) + ' ')} className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
            Fix punctuation
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {TAGS.map(t=>(
            <button key={t} onClick={()=>setTag(t)} className={`px-3 py-2 rounded-full text-xs font-black border-2 ${tag===t?'bg-black text-white border-black':'bg-white text-black border-black hover:bg-gray-100'}`}>{t}</button>
          ))}
        </div>
        <button onClick={submit} disabled={!draft.trim() || isPosting ||!zip} className="mt-5 w-full bg-blue-600 text-white font-black py-3 rounded-full disabled:opacity-50">
          {isPosting? 'POSTING...' : `POST AS ${tag.toUpperCase()} IN ${zip || '...'}`}
        </button>
      </div>

      <div className="space-y-4">
        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded-2xl p-5">
            <p className="text-black whitespace-pre-wrap text-sm break-words leading-relaxed">{p.body}</p>
            <div className="mt-2 text-xs font-black text-black/50">#{p.tag} • {p.zip_code}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
