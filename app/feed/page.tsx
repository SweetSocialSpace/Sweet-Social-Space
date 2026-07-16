'use client'
import { useState } from 'react'
import Header from '@/app/components/Header'
import { MicRecorder } from '@/components/mic/MicRecorder'
import { PinnedAutomatedAlert } from '@/components/PinnedAutomatedAlert'
import { EmergencyAlerts } from '@/components/EmergencyAlerts'
import { LatestAlerts } from '@/components/LatestAlerts'
import { WhatsHappeningNearYou } from '@/components/WhatsHappeningNearYou'
import { LiveNowStrip } from '@/components/LiveNowStrip'
import { LocationScopeBar } from '@/components/LocationScopeBar'
import { MarketplacePreview } from '@/components/MarketplacePreview'
import { BusinessDirectory } from '@/components/BusinessDirectory'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import { VerifiedSources } from '@/components/VerifiedSources'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

export default function FeedPage() {
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')

  return (
    <>
      <Header />
      <div className="max-w- mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[360px_1fr_380px] gap-6 items-start">
        <div className="space-y-4">
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>

        <div className="bg-black/50 backdrop-blur-2xl rounded- border border-white/10 p-5">
          <LocationScopeBar />
          <LiveNowStrip />
          <div className="bg-white rounded-2xl p-5 mt-4">
            <MicRecorder value={draft} onChange={setDraft} />
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map(t=>(
                <button key={t} onClick={()=>setTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${tag===t?'bg-black text-white':'bg-white text-black border-black'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
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
