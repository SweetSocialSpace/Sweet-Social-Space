import Header from '@/app/components/Header'

import PinnedAutomatedAlert from '@/components/PinnedAutomatedAlert'
import EmergencyAlerts from '@/components/EmergencyAlerts'
import LatestAlerts from '@/components/LatestAlerts'
import WhatsHappeningNearYou from '@/components/WhatsHappeningNearYou'

import MarketplacePreview from '@/components/MarketplacePreview'
import BusinessDirectory from '@/components/BusinessDirectory'
import UpcomingEvents from '@/components/UpcomingEvents'
import VerifiedSources from '@/components/VerifiedSources'

import LiveNowStrip from '@/components/LiveNowStrip'
import LocationScopeBar from '@/components/LocationScopeBar'

// These are the two you already have in app/feed/
import PostForm from './PostForm'
import PostList from './PostList'

export default function FeedPage() {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[340px_1fr_360px] gap-6 items-start">

        <div className="space-y-6">
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>

        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-5">
          <LocationScopeBar />
          <LiveNowStrip />
          <PostForm />
          <PostList />
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
