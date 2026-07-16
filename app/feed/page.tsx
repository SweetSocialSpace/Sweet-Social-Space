'use client'
import { useState } from 'react'
import Header from '@/app/components/Header'
import MicRecorder from '@/components/mic/MicRecorder'
import { PinnedAutomatedAlert } from '@/components/PinnedAutomatedAlert'
import { EmergencyAlerts } from '@/components/EmergencyAlerts'
import LatestAlerts from '@/components/LatestAlerts'
import WhatsHappeningNearYou from '@/components/WhatsHappeningNearYou'
import LiveNowStrip from '@/components/LiveNowStrip'
import LocationScopeBar from '@/components/LocationScopeBar'
import MarketplacePreview from '@/components/MarketplacePreview'
import BusinessDirectory from '@/components/BusinessDirectory'
import UpcomingEvents from '@/components/UpcomingEvents'
import VerifiedSources from '@/components/VerifiedSources'

export default function FeedPage() {
  const [draft, setDraft] = useState('')

  return (
    <>
      <Header />
      <div className="max-w- mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[360px_1fr_380px] gap-6 items-start">
        {/* LEFT — dark boxes */}
        <div className="space-y-4">
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>

        {/* CENTER — transparent */}
        <div className="bg-black/50 backdrop-blur-2xl rounded- border border-white/10 p-5">
          <LocationScopeBar />
          <div className="mt-3"><LiveNowStrip /></div>
          <div className="bg-white rounded-2xl p-5 mt-4">
            <MicRecorder value={draft} onChange={setDraft} />
          </div>
        </div>

        {/* RIGHT — dark boxes */}
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
