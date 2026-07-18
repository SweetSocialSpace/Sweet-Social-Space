import Header from '@/app/components/Header'

import PinnedAutomatedAlert from '@/components/PinnedAutomatedAlert'
import EmergencyAlerts from '@/components/EmergencyAlerts'
import LatestAlerts from '@/components/LatestAlerts'
import WhatsHappeningNearYou from '@/components/WhatsHappeningNearYou'

import MarketplacePreview from '@/components/MarketplacePreview'
import BusinessDirectory from '@/components/BusinessDirectory'
import UpcomingEvents from '@/components/UpcomingEvents'
import VerifiedSources from '@/components/VerifiedSources'

import FeedCenter from '@/components/feed/FeedCenter'

export default function FeedPage() {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[340px_1fr_360px] gap-6 items-start">

        {/* LEFT - Alerts and What's Happening */}
        <div className="space-y-6">
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>

        {/* CENTER - Your new warehouse does ALL the work */}
        <FeedCenter />

        {/* RIGHT - Business stuff */}
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
