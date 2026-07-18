'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

// YOUR existing folders - left border
import PinnedAutomatedAlert from '@/components/PinnedAutomatedAlert'
import EmergencyAlerts from '@/components/EmergencyAlerts'
import LatestAlerts from '@/components/LatestAlerts'
import WhatsHappeningNearYou from '@/components/WhatsHappeningNearYou'

// YOUR existing folders - center mic that feeds off smartPunctuate
import MicRecorder from '@/components/mic/MicRecorder'

// YOUR existing folders - right border
import MarketplacePreview from '@/components/MarketplacePreview'
import BusinessDirectory from '@/components/BusinessDirectory'
import UpcomingEvents from '@/components/UpcomingEvents'
import VerifiedSources from '@/components/VerifiedSources'
import LiveNowStrip from '@/components/LiveNowStrip'
import LocationScopeBar from '@/components/LocationScopeBar'

export default function FeedPage() {
  const [radius, setRadius] = useState(10)
  const supabase = createClient()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState('General')
  const [posts, setPosts] = useState<any[]>([])
  const [zip, setZip] = useState('95122')

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
  }

  return (
    <>
      <Header />
      {/* FIXED: max-w- was broken, now 1600px so center not squeezed */}
      <div className="max-w- mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[340px_1fr_360px] gap-6 items-start">

        {/* LEFT BORDER - each one lives in its own folder and auto-updates itself */}
        <div className="space-y-6">
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>

        {/* CENTER - only the map */}
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-5">
                    <LocationScopeBar zip={zip} radius={radius} setRadius={setRadius} />
          <LiveNowStrip />

          <div className="bg-white rounded-2xl p-5 mt-4 mb-6">
            {/* MIC FOLDER: this goes to components/mic/MicRecorder.tsx which feeds off./smartPunctuate.ts */}
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

        {/* RIGHT BORDER - each one auto-updates */}
        <div className="space-y-4">
          <MarketplacePreview />
          <BusinessDirectory />
          <UpcomingEvents />
          <VerifiedSources />
        </div>

      </div>
    </>
  )
}
