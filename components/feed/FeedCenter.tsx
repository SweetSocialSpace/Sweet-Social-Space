'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import MicRecorder from '@/components/mic/MicRecorder'
import LocationScopeBar from '@/components/LocationScopeBar'
import LiveNowStrip from '@/components/LiveNowStrip'
import { smartPunctuate } from '@/components/mic/smartPunctuate'

const TAGS = ["General","Alert","Recommendation","Free stuff","Hot take","Lost & found"] as const

export default function FeedCenter() {
  const supabase = createClient()
  const { zip: userZip } = useLocation()
  const { filter, setScope, scope } = useLocationScope()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<typeof TAGS[number]>('General')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    if (userZip &&!zip) setZip(userZip)
  }, [userZip])

  const load = async () => {
    if (!zip) return
    
    // Use radius-based filtering if user has coordinates
    if (filter.lat != null && filter.lng != null) {
      const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
      const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
      
      const { data } = await supabase
        .from('posts')
        .select('*')
        .gte('latitude', bbox.minLat)
        .lte('latitude', bbox.maxLat)
        .gte('longitude', bbox.minLng)
        .lte('longitude', bbox.maxLng)
        .order('created_at',{ascending:false})
        .limit(100)
      
      if (data) {
        // Apply precise radius filtering
        const filtered = applyScope(data, filter)
        setPosts(filtered)
      }
    } else {
      // Fallback to zip-based filtering if no coordinates
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('zip_code', zip) 
        .order('created_at',{ascending:false})
        .limit(100)
      if(data) setPosts(data)
    }
  }
  useEffect(()=>{ load() }, [zip, filter.scope, filter.lat, filter.lng])

  const submit = async ()=>{
    ;(window as any).__stopMic?.()
    if(!draft.trim() || isPosting ||!zip) return
    setIsPosting(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if(!user) return
      
      // Get user's coordinates from location scope for location-based posting
      const postData: any = {
        user_id: user.id,
        body: draft.trim(),
        tag,
        zip_code: zip 
      }
      
      // Add coordinates if available for radius-based filtering
      if (filter.lat != null && filter.lng != null) {
        postData.latitude = filter.lat
        postData.longitude = filter.lng
      }
      
      await supabase.from('posts').insert(postData)
      setDraft('')
      await load()
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="space-y-4">
      <LocationScopeBar />
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
            
            {/* Display video if available (for recorded live streams) */}
            {(p.video_url || p.media_url) && (
              <div className="mt-4">
                <video 
                  controls 
                  className="w-full rounded-xl border border-gray-200"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='20'%3E▶%3C/text%3E%3C/svg%3E"
                >
                  <source src={p.video_url || p.media_url} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-xs font-black text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                  📹 Recorded Live Stream
                </div>
              </div>
            )}
            
            <div className="mt-2 text-xs font-black text-black/50">#{p.tag} • {p.zip_code}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
