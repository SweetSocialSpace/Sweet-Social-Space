'use client'
import { useState, useEffect, Suspense, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useLocation } from '@/lib/location-context'
import Header from '@/app/components/Header'
import WelcomePost from '@/app/components/WelcomePost'
import GoLive from '@/components/GoLive'
import JoinLive from '@/components/JoinLive'
import React from 'react'

function CardShell({ minH, loading, children }: { minH: string, loading?: boolean, children: React.ReactNode }) {
  return (
    <div style={{ minHeight: minH }} className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden">
      {loading? <div className="h-full w-full bg-white/10 animate-pulse rounded-xl min-h-" /> : <div className="animate-in fade-in duration-300">{children}</div>}
    </div>
  )
}

function Safe({ loader, name }: { loader: () => Promise<any>, name: string }){
  const Comp = dynamic(() => loader().then((m:any)=> m.default || m[name] || m).catch(()=> ({ default: () => null })), { ssr: false, loading: () => null })
  return <ErrorBoundary name={name}><Comp /></ErrorBoundary>
}
class ErrorBoundary extends React.Component<{children:React.ReactNode, name:string},{hasError:boolean}>{
  state = {hasError:false}
  static getDerivedStateFromError(){ return {hasError:true} }
  componentDidCatch(err:any){ console.log(`[HOUSE] ${this.props.name} failed:`, err.message) }
  render(){ return this.state.hasError? null : this.props.children as any }
}

function FeedContent() {
  const [filter, setFilter] = useState('all')
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<any[]>([])
  const { zip: locationZip } = useLocation()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [nearZip, setNearZip] = useState<string>('')
  const [radius, setRadius] = useState<number>(5)
  const [joinLivePost, setJoinLivePost] = useState<any>(null)

  useEffect(() => {
    const f = searchParams.get('filter'); if (f) setFilter(f)
    const savedRadius = localStorage.getItem('feed_radius')
    if (savedRadius) setRadius(parseInt(savedRadius))
  }, [searchParams])

  const handleFilter = (id: string) => { setFilter(id); router.push(id === 'all'? '/feed' : `/feed?filter=${id}`) }
  const handleRadiusChange = (newRadius: number) => { setRadius(newRadius); localStorage.setItem('feed_radius', String(newRadius)) }

  const FILTERS = [{ id: 'all', label: 'All' }, { id: 'faith', label: 'Faith' }, { id: 'general', label: 'General' }, { id: 'safety', label: 'Safety' }, { id: 'for_sale', label: 'For Sale' }, { id: 'free', label: 'Free' }, { id: 'lost_pet', label: 'Lost Pet' }, { id: 'event', label: 'Event' }, { id: 'help', label: 'Help' }, { id: 'recommend', label: 'Recommend' }]

  const fetchPosts = useCallback(async (zipToUse?: string, radiusToUse: number = radius) => {
    let query = supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(150)
    if (zipToUse) query = query.or(`zip_code.eq.${zipToUse},zip_code.eq.GLOBAL`)
    const { data } = await query
    if (data) setPosts(data)
  }, [supabase, radius])

  useEffect(() => {
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (locationZip) { setNearZip(locationZip); fetchPosts(locationZip) } return }
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('*').or(`user_id.eq.${user.id},id.eq.${user.id}`).single()
      if(profile){
        setCurrentProfile(profile)
        const zipVal = profile.zip_code || profile.zip
        if(zipVal) setNearZip(zipVal); else if (locationZip) setNearZip(locationZip)
        fetchPosts(zipVal || locationZip, radius)
        if(!profile.username) router.push('/profile?required=1')
      } else if (locationZip) { setNearZip(locationZip); fetchPosts(locationZip) }
    })()
  }, [])

  useEffect(()=>{ if (nearZip) fetchPosts(nearZip, radius) }, [radius])

  const handleLivePosted = (newPost:any) => setPosts(prev=>[newPost,...prev])
  const handleLiveEnded = (endedId: string, videoUrl?: string) => setPosts(prev => prev.map(p => p.id === endedId? {...p, tag: 'live_ended', body: (p.body||'').replace('LIVE NOW','Was Live'), video_url: videoUrl, media_url: videoUrl, media_urls: videoUrl? [videoUrl] : undefined} : p))

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) setPosts(prev => prev.filter((p:any) => p.id!== postId))
  }

  const filtered = filter==='all'? posts : posts.filter((p:any)=> { const cat = (p.category||p.tag||'').toLowerCase().replace(/\s*&\s*/g,'_').replace(/\s+/g,'_'); return cat===filter || cat.includes(filter) })

  const authorName = currentProfile?.username || currentProfile?.display_name || 'there'
  const displayZip = nearZip || locationZip || ''
  const displayCity = currentProfile?.city || 'your area'
  const isGlobal =!displayZip || displayZip === 'GLOBAL'

  return (
    <>
      <Safe loader={() => import('@/components/PermissionsGate')} name="PermissionsGate" />
      <Header />
      <div className="max-w- mx-auto px-3 xl:px-4 py-4 grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_380px] 2xl:grid-cols-[320px_minmax(640px,860px)_400px] gap-4 xl:gap-5 items-start w-full justify-center">
        <div className="space-y-4 xl:sticky xl:top-20">
          <CardShell minH="110px"><Safe loader={() => import('@/components/live-pulse/LivePulse')} name="LivePulse" /></CardShell>
          <CardShell minH="140px"><Safe loader={() => import('@/components/AIMayor')} name="AIMayor" /></CardShell>
          <CardShell minH="120px"><Safe loader={() => import('@/components/LiveMap')} name="LiveMap" /></CardShell>
          <CardShell minH="90px"><Safe loader={() => import('@/components/trust-meter/TrustMeter')} name="TrustMeter" /></CardShell>
          <CardShell minH="110px"><Safe loader={() => import('@/components/WeatherBar')} name="WeatherBar" /></CardShell>
          <CardShell minH="100px"><Safe loader={() => import('@/components/PinnedAutomatedAlert')} name="PinnedAutomatedAlert" /></CardShell>
          <CardShell minH="100px"><Safe loader={() => import('@/components/EmergencyAlerts')} name="EmergencyAlerts" /></CardShell>
          <CardShell minH="120px"><Safe loader={() => import('@/components/LatestAlerts')} name="LatestAlerts" /></CardShell>
          <CardShell minH="120px"><Safe loader={() => import('@/components/WhatsHappeningNearYou')} name="WhatsHappeningNearYou" /></CardShell>
        </div>

        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 xl:p-6 w-full min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-white/60 text-xs font-bold">Near</span>
            <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full">{isGlobal? displayCity : displayZip}</span>
            <select value={radius} onChange={(e)=>handleRadiusChange(parseInt(e.target.value))} className="bg-white/10 text-white rounded-full px-3 py-1 text-xs font-bold border border-white/20">
              <option value={5}>5 mi</option><option value={10}>10 mi</option><option value={15}>15 mi</option><option value={20}>20 mi</option>
            </select>
            <span className="text-white/40 text-xs">• {filtered.length} posts</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="bg-green-500 text-black px-2.5 py-1 rounded-full text-xs font-bold">LIVE</span>
              <GoLive userId={currentUserId || undefined} zipCode={nearZip || 'GLOBAL'} city="" onLivePosted={handleLivePosted} onLiveEnded={handleLiveEnded} />
            </div>
          </div>

          <div className="mt-4"><Safe loader={() => import('@/components/CreatePost')} name="CreatePost" /></div>
          <div className="mt-2 text-xs text-white/40 px-1">Posting as {authorName} • {isGlobal? displayCity : displayZip} • {radius}mi</div>

          <div className="flex gap-2 overflow-x-auto py-3 mt-2 -mx-1 px-1">
            {FILTERS.map(f=>(<button key={f.id} onClick={()=>handleFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 ${filter===f.id?'bg-white text-black border-white':'bg-white/10 text-white border-white/20'}`}>{f.label}</button>))}
          </div>

          <div className="space-y-3 mt-2">
            {filtered.length===0 && <WelcomePost />}
            {filtered.map((p:any)=>{
              const isEnded = p.tag === 'live_ended'
              const displayBody = isEnded? (p.body||p.content||'').replace('LIVE NOW','Was Live') : (p.body||p.content)
              return (
                <div key={p.id} className="bg-white rounded-2xl p-5 border-l-4 shadow-xl break-words">
                  <p className="text-black whitespace-pre-wrap break-words leading-6">{displayBody}</p>
                  {p.tag === 'live' && p.livekit_room && <button onClick={() => setJoinLivePost(p)} className="mt-3 bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm w-full">🔴 Join Live Stream</button>}
                  {isEnded && (
                    <>
                      {(p.video_url || p.media_url || (p.media_urls && p.media_urls[0])) && (
                        <video controls className="mt-3 w-full rounded-xl" src={p.video_url || p.media_url || (p.media_urls && p.media_urls[0])} />
                      )}
                      <div className="mt-3 text-xs text-white bg-gray-800 rounded-full px-3 py-2 inline-block">Was Live • {new Date(p.created_at).toLocaleString()} • {p.zip_code}</div>
                    </>
                  )}
                  <div className="mt-2 text-xs text-gray-400">{new Date(p.created_at).toLocaleString()} • {p.zip_code === 'GLOBAL'? displayCity : (p.zip_code || displayZip)}</div>
                  {currentUserId && p.user_id === currentUserId && <button onClick={()=>deletePost(p.id)} className="mt-2 bg-red-100 text-red-600 rounded-full px-3 py-1 text-xs font-bold">Delete</button>}
                </div>
              )
            })}
          </div>

          {joinLivePost && <JoinLive roomName={joinLivePost.livekit_room} userName={currentProfile?.username || 'User'} onClose={() => setJoinLivePost(null)} />}
        </div>

        <div className="space-y-4 xl:sticky xl:top-20">
          <Safe loader={() => import('@/components/FaithOfTheDay')} name="FaithOfTheDay" />
          <Safe loader={() => import('@/components/BusinessDirectory')} name="BusinessDirectory" />
          <Safe loader={() => import('@/components/MarketplacePreview')} name="MarketplacePreview" />
        </div>
      </div>

      {/* FOOTER NOW AT BOTTOM - NOT IN SIDE COLUMN */}
      <Safe loader={() => import('@/components/GlobalFooter')} name="GlobalFooter" />

    </>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Loading...</div>}>
      <FeedContent />
    </Suspense>
  )
}
