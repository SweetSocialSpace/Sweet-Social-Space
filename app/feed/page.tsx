'use client'
import { useState } from 'react'
import Header from '@/app/components/Header'
import MicRecorder from '@/components/mic/MicRecorder'
import { PinnedAutomatedAlert } from '@/components/PinnedAutomatedAlert'
import { EmergencyAlerts } from '@/components/EmergencyAlerts'
import LatestAlerts from '@/components/LatestAlerts'
import WhatsHappeningNearYou from '@/components/WhatsHappeningNearYou'
import LiveNowStrip from '@/components/LiveNowStrip'
import { LocationScopeBar } from '@/components/LocationScopeBar'
import MarketplacePreview from '@/components/MarketplacePreview'
import BusinessDirectory from '@/components/BusinessDirectory'
import UpcomingEvents from '@/components/UpcomingEvents'
import VerifiedSources from '@/components/VerifiedSources'
import { createClient } from '@/lib/supabase/client'

export default function FeedPage() {
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [radius, setRadius] = useState(10)
  const [zip] = useState('95122')

  const handlePost = async () => {
    if(!draft.trim()) return
    setPosting(true)
    try{
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('posts').insert({
        body: draft,
        content: draft,
        user_id: user?.id,
        zip_code: zip
      })
      setDraft('')
    }finally{
      setPosting(false)
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[360px_1fr_380px] gap-6 items-start">
        <div className="space-y-4">
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>

        <div className="bg-black/50 backdrop-blur-2xl rounded-xl border border-white/10 p-5">
          <LocationScopeBar zip={zip} radius={radius} setRadius={setRadius} />
          <div className="mt-3"><LiveNowStrip /></div>
          <div className="bg-white rounded-2xl p-5 mt-4 shadow-xl">
            <MicRecorder value={draft} onChange={setDraft} />
            <button onClick={handlePost} disabled={posting ||!draft.trim()} className="w-full mt-4 bg-black text-white rounded-xl py-3 font-black text-sm hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {posting? 'Posting...' : `Post to ${zip} →`}
            </button>
          </div>
          <p className="text-xs text-white/40 mt-3 text-center">Your voice posts will appear in "What's happening near you" →</p>
        </div>

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
