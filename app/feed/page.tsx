'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useLocation } from '@/lib/location-context'
import Header from '@/app/components/Header'
import WelcomePost from '@/app/components/WelcomePost'
import React from 'react'

function Safe({ loader, name }: { loader: () => Promise<any>, name: string }){
  const Comp = dynamic(
    () => loader().then((m:any)=> m.default || m[name] || m).catch(()=> ({ default: () => null })),
    { ssr: false, loading: () => null }
  )
  return <ErrorBoundary name={name}><Comp /></ErrorBoundary>
}

class ErrorBoundary extends React.Component<{children:React.ReactNode, name:string},{hasError:boolean}>{
  state = {hasError:false}
  static getDerivedStateFromError(){ return {hasError:true} }
  componentDidCatch(err:any){ console.log(`[HOUSE] ${this.props.name} failed, skipping:`, err.message) }
  render(){ return this.state.hasError? null : this.props.children as any }
}

function FeedContent() {
  const [filter, setFilter] = useState('all')
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<any[]>([])
  const { zip } = useLocation()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)

  useEffect(() => { const f = searchParams.get('filter'); if (f) setFilter(f) }, [searchParams])

  const handleFilter = (id: string) => {
    setFilter(id)
    router.push(id === 'all'? '/feed' : `/feed?filter=${id}`)
  }

  const FILTERS = [
    { id: 'all', label: 'All 🌎' }, { id: 'faith', label: 'Faith ✝' },
    { id: 'general', label: 'General 😊' }, { id: 'safety', label: 'Safety 🚨' },
    { id: 'for_sale', label: 'For Sale 💰' }, { id: 'free', label: 'Free 🎁' },
    { id: 'lost_pet', label: 'Lost Pet 🐶' }, { id: 'event', label: 'Event 🎉' },
    { id: 'help', label: 'Help 🤝' }, { id: 'recommend', label: 'Tacos 🌮' },
  ]

  const fetchPosts = async (zipToUse?: string) => {
    const z = zipToUse || zip
    if (!z) return
    const { data } = await supabase.from('posts').select('*').eq('zip_code', z).order('created_at',{ascending:false}).limit(100)
    if(data) setPosts(data)
  }

  useEffect(() => {
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('*').or(`user_id.eq.${user.id},id.eq.${user.id}`).single()
      if(profile){
        setCurrentProfile(profile)
        const zipVal = profile.zip || profile.zip_code
        if(zipVal) fetchPosts(zipVal)
        if(!profile.username) router.push('/profile?required=1')
      }
    })()
  }, [])

  useEffect(()=>{ if (zip) fetchPosts(zip) }, [zip])

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) setPosts(prev => prev.filter((p:any) => p.id!== postId))
  }

  const filtered = filter==='all'? posts : posts.filter((p:any)=> {
    const cat = (p.category||p.tag||'').toLowerCase().replace(/\s*&\s*/g,'_').replace(/\s+/g,'_')
    return cat===filter || cat.includes(filter)
  })

  const authorName = currentProfile?.username? currentProfile.username : 'YOUR BLOCK'

  return (
    <>
      <Safe loader={() => import('@/components/PermissionsGate')} name="PermissionsGate" />
      <Header />
      <div className="max-w- mx-auto px-3 xl:px-4 py-4 grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_380px] 2xl:grid-cols-[320px_minmax(640px,860px)_400px] gap-4 xl:gap-5 items-start w-full justify-center">
        <div className="space-y-4 xl:sticky xl:top-20">
          <Safe loader={() => import('@/components/live-pulse/LivePulse')} name="LivePulse" />
          <Safe loader={() => import('@/components/AIMayor')} name="AIMayor" />
          <Safe loader={() => import('@/components/BlockMap')} name="BlockMap" />
          <Safe loader={() => import('@/components/trust-meter/TrustMeter')} name="TrustMeter" />
          <Safe loader={() => import('@/components/WeatherBar')} name="WeatherBar" />
          <Safe loader={() => import('@/components/PinnedAutomatedAlert')} name="PinnedAutomatedAlert" />
          <Safe loader={() => import('@/components/EmergencyAlerts')} name="EmergencyAlerts" />
          <Safe loader={() => import('@/components/LatestAlerts')} name="LatestAlerts" />
          <Safe loader={() => import('@/components/WhatsHappeningNearYou')} name="WhatsHappeningNearYou" />
        </div>
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 xl:p-6 w-full min-w-0">
          <Safe loader={() => import('@/components/LocationScopeBar')} name="LocationScopeBar" />
          <div className="mt-4"><Safe loader={() => import('@/components/LiveNowStrip')} name="LiveNowStrip" /></div>
          <div className="mt-4"><Safe loader={() => import('@/components/CreatePost')} name="CreatePost" /></div>
          <div className="mt-2 text-xs text-white/40 px-1">Posting as • {authorName}</div>
          <div className="flex gap-2 overflow-x-auto py-3 mt-2 -mx-1 px-1">
            {FILTERS.map(f=>(
              <button key={f.id} onClick={()=>handleFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap border-2 shrink-0 ${filter===f.id?'bg-white text-black border-white':'bg-white/10 text-white border-white/20'}`}>{f.label}</button>
            ))}
          </div>
          <div className="space-y-3 mt-2">
            {filtered.length===0 && <WelcomePost />}
            {filtered.map((p:any)=>(
              <div key={p.id} className="bg-white rounded-2xl p-5 border-l-4 shadow-xl break-words">
                <p className="text-black whitespace-pre-wrap break-words text- leading-6">{p.body}</p>
                <div className="mt-2 text-xs text-gray-400">{new Date(p.created_at).toLocaleString()} • {zip}</div>
                {currentUserId && p.user_id === currentUserId && <button onClick={()=>deletePost(p.id)} className="mt-2 bg-red-100 text-red-600 rounded-full px-3 py-1 text-xs font-black">X</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 xl:sticky xl:top-20">
          <Safe loader={() => import('@/components/FaithOfTheDay')} name="FaithOfTheDay" />
          <Safe loader={() => import('@/app/components/TheDrop')} name="TheDrop" />
          <Safe loader={() => import('@/components/KarmaLeaderboard')} name="KarmaLeaderboard" />
          <Safe loader={() => import('@/components/proximity-ping/ProximityPing')} name="ProximityPing" />
          <Safe loader={() => import('@/components/street-heat/StreetHeat')} name="StreetHeat" />
          <Safe loader={() => import('@/components/MarketplacePreview')} name="MarketplacePreview" />
          <Safe loader={() => import('@/components/BusinessDirectory')} name="BusinessDirectory" />
          <Safe loader={() => import('@/components/own-this-block/OwnThisBlock')} name="OwnThisBlock" />
          <Safe loader={() => import('@/components/UpcomingEvents')} name="UpcomingEvents" />
          <Safe loader={() => import('@/components/VerifiedSources')} name="VerifiedSources" />
        </div>
      </div>
      <Safe loader={() => import('@/components/GoLive')} name="GoLive" />
    </>
  )
}

export default function FeedPage() {
  return <Suspense fallback={<div className="text-white p-10 text-center">Loading feed...</div>}><FeedContent /></Suspense>
}
