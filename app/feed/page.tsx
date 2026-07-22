'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import FaithOfTheDay from '@/components/FaithOfTheDay'
import { TrustMeter } from '@/components/trust-meter/TrustMeter'
import StreetHeat from '@/components/street-heat/StreetHeat'
import ProximityPing from '@/components/proximity-ping/ProximityPing'
import LivePulse from '@/components/live-pulse/LivePulse'
import AIMayor from '@/components/AIMayor'
import BlockMap from '@/components/BlockMap'
import KarmaLeaderboard from '@/components/KarmaLeaderboard'
import { PinnedAutomatedAlert } from '@/components/PinnedAutomatedAlert'
import TheDrop from '@/components/the-drop/TheDrop'
import EmergencyAlerts from '@/components/EmergencyAlerts'
import LatestAlerts from '@/components/LatestAlerts'
import WhatsHappeningNearYou from '@/components/WhatsHappeningNearYou'
import LiveNowStrip from '@/components/LiveNowStrip'
import LocationScopeBar from '@/components/LocationScopeBar'
import MarketplacePreview from '@/components/MarketplacePreview'
import BusinessDirectory from '@/components/BusinessDirectory'
import UpcomingEvents from '@/components/UpcomingEvents'
import VerifiedSources from '@/components/VerifiedSources'
import WeatherBar from '@/components/WeatherBar'
import CreatePost from '@/components/CreatePost'
import { useLocation } from '@/lib/location-context'

export default function FeedPage() {
  const [filter, setFilter] = useState('all')
  const supabase = createClient()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [radius, setRadius] = useState(5)
  const { zip, city } = useLocation()
  const [localZip, setLocalZip] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => { if (zip) setLocalZip(zip) }, [zip])

  const FILTERS = [
    { id: 'all', label: 'All 🌎' },
    { id: 'faith', label: 'Faith ✝️' },
    { id: 'general', label: 'General 😊' },
    { id: 'safety', label: 'Safety 🚨' },
    { id: 'for_sale', label: 'For Sale 💰' },
    { id: 'free', label: 'Free 🎁' },
    { id: 'lost_pet', label: 'Lost Pet 🐶' },
    { id: 'event', label: 'Event 🎉' },
    { id: 'help', label: 'Help 🤝' },
    { id: 'recommend', label: 'Tacos 🌮' },
  ]

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
    if(data) setPosts(data)
  }

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('zip_code, display_name').eq('id', user.id).single()
      if (!profile ||!profile.zip_code ||!profile.display_name) {
        router.push('/profile?required=1')
      } else if (profile.zip_code &&!zip) {
        setLocalZip(profile.zip_code)
      }
    })()
  }, [])

  useEffect(()=>{ fetchPosts() }, [])

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) setPosts(prev => prev.filter((p:any) => p.id!== postId))
  }

  const filteredBase = filter==='all'? posts : posts.filter((p:any)=> {
    const cat = (p.category||p.tag||'').toLowerCase().replace(/\s*&\s*/g,'_').replace(/\s+/g,'_')
    return cat===filter || cat.includes(filter)
  })

  const filtered = [...filteredBase].sort((a:any, b:any) => {
    const now = Date.now()
    const isLostA = (a.category||'').toLowerCase().includes('lost_pet') || (a.category||'').toLowerCase().includes('lost pet')
    const isLostB = (b.category||'').toLowerCase().includes('lost_pet') || (b.category||'').toLowerCase().includes('lost pet')
    const isFreshA = isLostA && (now - new Date(a.created_at).getTime() < 48*60*60*1000)
    const isFreshB = isLostB && (now - new Date(b.created_at).getTime() < 48*60*60*1000)
    if (isFreshA &&!isFreshB) return -1
    if (!isFreshA && isFreshB) return 1
    return 0
  })

  const catBadge = (cat: string) => {
    const map: any = { general:'😊', safety:'🚨', for_sale:'💰', free:'🎁', lost_pet:'🐶', event:'🎉', help:'🤝', recommend:'🌮', job:'💼', faith:'✝️' }
    return map[cat] || '📌'
  }

  const trustLevel = (p:any) => {
    if(p.user_id === currentUserId) return { label:'YOU', color:'bg-black text-white' }
    return { label:`VERIFIED • ${localZip || zip || 'YOUR BLOCK'}`, color:'bg-blue-600 text-white' }
  }

  return (
    <>
      <Header />
     <div className="max-w- mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)_360px] gap-6 items-start w-full">
        <div className="space-y-6">
          <LivePulse />
          <AIMayor />
          <BlockMap />
          <TrustMeter />
          <WeatherBar zip={localZip || zip} />
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-5">
          <LocationScopeBar zip={localZip || zip} radius={radius} setRadius={setRadius} />
          <div className="mt-4"><LiveNowStrip /></div>
         <div className="mt-4"><CreatePost onPosted={fetchPosts} /></div>
          <div className="flex gap-2 overflow-x-auto py-3 mt-2 -mx-1 px-1">
            {FILTERS.map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap border-2 transition ${filter===f.id?'bg-white text-black border-white':'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>{f.label}</button>
            ))}
          </div>
          <div className="space-y-3 mt-2">
            {filtered.length===0 && <div className="text-white/40 text-center py-8 text-sm">No {filter} posts yet in {localZip || zip} - be first!</div>}
            {filtered.map((p:any)=>{
              const t = trustLevel(p)
              const isLost = (p.category||'').toLowerCase().includes('lost_pet') || (p.category||'').toLowerCase().includes('lost pet')
              const isFreshLost = isLost && (Date.now() - new Date(p.created_at).getTime() < 48*60*60*1000)
              return (
              <div key={p.id} className={`bg-white rounded-2xl p-5 border-l-4 shadow-xl ${isFreshLost? 'ring-4 ring-yellow-400 bg-yellow-50' : ''}`}style={{borderLeftColor: isFreshLost? '#f59e0b' : p.category==='safety'?'#ef4444': p.category==='for_sale'?'#22c55e': p.category==='lost_pet'?'#f59e0b': p.category==='faith'?'#7c3aed':'#000'}}>
                {isFreshLost && <div className="text-xs font-black bg-yellow-400 text-black px-2 py-1 rounded-full inline-block mb-2">⭐ PINNED • LOST PET • 48HR GOLD</div>}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                     <span className={`text-xs font-black px-2 py-1 rounded-full ${p.category==='faith'?'bg-purple-700 text-white':'bg-black text-white'}`}>{catBadge(p.category||'general')} {(p.category||p.tag||'general').toUpperCase()}</span>
                      <span className={`text- font-black px-2 py-1 rounded-full ${t.color}`}>{t.label} ✓</span>
                      {p.price!=null && <span className="text-xs font-black bg-green-500 text-white px-2 py-1 rounded-full">${Number(p.price).toFixed(0)}</span>}
                      {p.audio_url && <span className="text-xs font-black bg-purple-600 text-white px-2 py-1 rounded-full">🎙 VOICE</span>}
                    </div>
                    <p className="text-black whitespace-pre-wrap break-words text- leading-snug">{p.body}</p>
                    {p.audio_url && (
                      <audio controls className="mt-3 w-full h-8"><source src={p.audio_url} /></audio>
                    )}
                    {p.location_address && (
                      <div className="mt-3 flex gap-2 items-center flex-wrap">
                        <span className="text-xs bg-gray-100 text-black px-2 py-1 rounded-full border">📍 Near {localZip || zip} • Private</span>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(p.location_address)}`} target="_blank" className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-black transition">🗺 Get Directions</a>
                      </div>
                    )}
                  </div>
                  {currentUserId && p.user_id === currentUserId && (
                    <button onClick={()=>deletePost(p.id)} className="bg-red-100 hover:bg-red-600 hover:text-white text-red-600 rounded-full px-3 py-1 text-xs font-black border border-red-300">X</button>
                  )}
                </div>
                <div className="mt-2 text-xs font-bold text-gray-400">{new Date(p.created_at).toLocaleString()} • {localZip || zip} • {p.audio_url?'🎙 Voice Story':''}</div>
              </div>
            )})}
          </div>
        </div>
        <div className="space-y-6">
          <FaithOfTheDay />
          <TheDrop />
          <KarmaLeaderboard />
          <ProximityPing />
          <StreetHeat />
          <MarketplacePreview />
          <BusinessDirectory />
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 border-2 border-black">
            <div className="text-black font-black text-sm">OWN THIS BLOCK? 💰</div>
            <div className="text-black/80 text-xs mt-1">Pin your business in {localZip || zip} for $49/mo</div>
            <a href="/business/claim" className="mt-3 block bg-black text-white text-xs font-black px-4 py-2 rounded-full text-center">CLAIM {localZip || zip} →</a>
          </div>
          <UpcomingEvents />
          <VerifiedSources />
        </div>
      </div>
    </>
  )
}
