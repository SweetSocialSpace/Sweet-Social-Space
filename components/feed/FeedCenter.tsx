'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import MicRecorder from '@/components/mic/MicRecorder'
import LocationScopeBar from '@/components/LocationScopeBar'
import LiveNowStrip from '@/components/LiveNowStrip'
import { smartPunctuate } from '@/components/mic/smartPunctuate'

const TAG_KEYS = ["general","alert","recommendation","free_stuff","hot_take","lost_found"] as const

export default function FeedCenter() {
  const supabase = createClient()
  const { zip: userZip } = useLocation()
  const { filter, scope } = useLocationScope()
  const { language } = useLanguage()
  const t = useTranslations()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<typeof TAG_KEYS[number]>('general')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    if (userZip && !zip) setZip(userZip)
  }, [userZip])

  const load = async () => {
    if (!zip) return
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
      if (data) setPosts(applyScope(data, filter))
    } else {
      const { data } = await supabase.from('posts').select('*').eq('zip_code', zip).order('created_at',{ascending:false}).limit(100)
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
      const postData: any = { user_id: user.id, body: draft.trim(), tag, zip_code: zip }
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
          placeholder={zip ? (t.feed?.placeholder || `What's happening in ${zip}?`).replace('{zip}', zip) : (t.feed?.loadingLocation || "Loading location...")}
          className="w-full min-h-40 resize-none rounded-xl border border-gray-200 p-4 text-sm text-black outline-none focus:ring-2 focus:ring-black/10"
        />
        <div className="mt-4 flex items-center justify-between">
          <MicRecorder onTranscript={setDraft} />
          <button onClick={()=> setDraft(smartPunctuate(draft) + ' ')} className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
            {t.feed?.fixPunctuation || 'Fix punctuation'}
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {TAG_KEYS.map(key=>(
            <button key={key} onClick={()=>setTag(key)} className={`px-3 py-2 rounded-full text-xs font-black border-2 ${tag===key?'bg-black text-white border-black':'bg-white text-black border-black hover:bg-gray-100'}`}>
              {t.feed?.tags?.[key] || key}
            </button>
          ))}
        </div>
        <button onClick={submit} disabled={!draft.trim() || isPosting ||!zip} className="mt-5 w-full bg-blue-600 text-white font-black py-3 rounded-full disabled:opacity-50">
          {isPosting ? (t.feed?.posting || 'POSTING...') : `${t.feed?.postAs || 'POST AS'} ${ (t.feed?.tags?.[tag] || tag).toUpperCase() } ${t.feed?.in || 'IN'} ${zip || '...'}`}
        </button>
      </div>

      <div className="space-y-4">
        {posts.map(p=>(
          <div key={p.id} className="bg-white rounded-2xl p-5">
            <p className="text-black whitespace-pre-wrap text-sm break-words leading-relaxed">{p.body}</p>
            {(p.video_url || p.media_url) && (
              <div className="mt-4">
                <video controls className="w-full rounded-xl border border-gray-200">
                  <source src={p.video_url || p.media_url} type="video/webm" />
                </video>
                <div className="mt-2 text-xs font-black text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                  {t.feed?.recordedLive || '📹 Recorded Live Stream'}
                </div>
              </div>
            )}
            <div className="mt-2 text-xs font-black text-black/50">#{t.feed?.tags?.[p.tag] || p.tag} • {p.zip_code}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
