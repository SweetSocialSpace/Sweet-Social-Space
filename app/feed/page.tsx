'use client'
import GlobalFooter from '@/components/GlobalFooter'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useLocation } from '@/lib/location-context'
import Header from '@/app/components/Header'
import WelcomePost from '@/app/components/WelcomePost'
import GoLive from '@/components/GoLive'
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
  componentDidCatch(err:any){ console.log(`[HOUSE] ${this.props.name} failed:`, err.message) }
  render(){ return this.state.hasError? null : this.props.children as any }
}

function milesBetween(lat1:number, lon1:number, lat2:number, lon2:number){
  const R=3959
  const dLat=(lat2-lat1)*Math.PI/180
  const dLon=(lon2-lon1)*Math.PI/180
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}

function FeedContent() {
  const [filter, setFilter] = useState('all')
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<any[]>([])
  const { zip: locationZip, city: locationCity } = useLocation()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [nearZip, setNearZip] = useState<string>('')
  const [radius, setRadius] = useState<number>(5)
  const [userLatLon, setUserLatLon] = useState<{lat:number, lon:number} | null>(null)

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f) setFilter(f)
    const savedRadius = localStorage.getItem('feed_radius')
    if (savedRadius) setRadius(parseInt(savedRadius))
  }, [searchParams])

  const handleFilter = (id: string) => {
    setFilter(id)
    router.push(id === 'all'? '/feed' : `/feed?filter=${id}`)
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    localStorage.setItem('feed_radius', String(newRadius))
  }

  const FILTERS = [
    { id: 'all', label: 'All' }, { id: 'faith', label: 'Faith' },
    { id: 'general', label: 'General' }, { id: 'safety', label: 'Safety' },
    { id: 'for_sale', label: 'For Sale' }, { id: 'free', label: 'Free' },
    { id: 'lost_pet', label: 'Lost Pet' }, { id: 'event', label: 'Event' },
    { id: 'help', label: 'Help' }, { id: 'recommend', label: 'Recommend' },
  ]

  const fetchPosts = async (zipToUse?: string, radiusToUse: number = radius) => {
    const z = zipToUse || nearZip || locationZip
    if (!z) return

    if (z === 'GLOBAL') {
      const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
      if(data) setPosts(data)
      return
    }

    // Get lat/lon for radius filtering from internet - per RULES.md
    if (!userLatLon) {
      const geo = await fetch(`/api/zips?zip=${z}`).then(r=>r.json()).catch(()=>null)
      if (geo?.lat && geo?.lon) setUserLatLon({ lat: parseFloat(geo.lat), lon: parseFloat(geo.lon) })
    }

    // Fetch by zip first, then filter by radius if we have lat/lon - GLOBAL works for any zip
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(150)
    if (!data) return

    if (userLatLon) {
      const filteredByRadius = data.filter((p:any)=>{
        if (!p.lat ||!p.lon) return p.zip_code === z // fallback to zip match
        return milesBetween(userLatLon.lat, userLatLon.lon, p.lat, p.lon) <= radiusToUse
      })
      setPosts(filteredByRadius)
    } else {
      setPosts(data.filter((p:any)=> p.zip_code === z ||!p.zip_code))
    }
  }

  useEffect(() => {
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (locationZip) {
          setNearZip(locationZip)
          fetchPosts(locationZip)
        }
        return
      }
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('*').or(`user_id.eq.${user.id},id.eq.${user.id}`).single()
      if(profile){
        setCurrentProfile(profile)
        const zipVal = profile.zip_code || profile.zip
        if(zipVal) {
          setNearZip(zipVal)
          const geo = await fetch(`/api/zips?zip=${zipVal}`).then(r=>r.json()).catch(()=>null)
          if (geo?.lat) setUserLatLon({ lat: parseFloat(geo.lat), lon: parseFloat(geo.lon) })
          fetchPosts(zipVal)
        } else if (locationZip) {
          setNearZip(locationZip)
          fetchPosts(locationZip)
        }
        if(!profile.username) router.push('/profile?required=1')
      } else if (locationZip) {
        setNearZip(locationZip)
        fetchPosts(locationZip)
      }
    })()
  }, [])

  useEffect(()=>{
    if (!nearZip && locationZip) {
      setNearZip(locationZip)
      fetchPosts(locationZip)
    }
  }, [locationZip, nearZip])

  useEffect(()=>{
    if (nearZip) fetchPosts(nearZip, radius)
  }, [radius, userLatLon])

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) setPosts(prev => prev.filter((p:any) => p.id!== postId))
  }

  const filtered = filter==='all'? posts : posts.filter((p:any)=> {
    const cat = (p.category||p.tag||'').toLowerCase().replace(/\s*&\s*/g,'_').replace(/\s+/g,'_')
    return cat===filter || cat.includes(filter)
  })

  const authorName = currentProfile?.username || currentProfile?.display_name || 'there'
  const displayZip = nearZip || locationZip || ''
  const displayCity = currentProfile?.city || locationCity || 'your area'
  const isGlobal =!displayZip || displayZip === 'GLOBAL'

  return (
    <>
      <Safe loader={() => import('@/components/PermissionsGate')} name="PermissionsGate" />
      <Header />
      <div className="max-w- mx-auto px-3 xl:px-4 py-4 grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_380px] 2xl:grid-cols-[320px_minmax(640px,860px)_400px] gap-4 xl:gap-5 items-start w-full justify-center">
        <div className="space-y-4 xl:sticky xl:top-20">
          <Safe loader={() => import('@/components/live-pulse/LivePulse')} name="LivePulse" />
          <Safe loader={() => import('@/components/AIMayor')} name="AIMayor" />
          <Safe loader={() => import('@/components/LiveMap')} name="LiveMap" />
          <Safe loader={() => import('@/components/trust-meter/TrustMeter')} name="TrustMeter" />
          <Safe loader={() => import('@/components/WeatherBar')} name="WeatherBar" />
          <Safe loader={() => import('@/components/PinnedAutomatedAlert')} name="PinnedAutomatedAlert" />
          <Safe loader={() => import('@/components/EmergencyAlerts')} name="EmergencyAlerts" />
          <Safe loader={() => import('@/components/LatestAlerts')} name="LatestAlerts" />
          <Safe loader={() => import('@/components/WhatsHappeningNearYou')} name="WhatsHappeningNearYou" />
        </div>

        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 xl:p-6 w-full min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-white/60 text-xs font-bold">Near</span>
            <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full">
              {isGlobal? displayCity : displayZip}
            </span>
            <select
              value={radius}
              onChange={(e)=>handleRadiusChange(parseInt(e.target.value))}
              className="bg-white/10 text-white rounded-full px-3 py-1 text-xs font-bold border border-white/20"
            >
              <option value={5}>5 mi</option>
              <option value={10}>10 mi</option>
              <option value={15}>15 mi</option>
              <option value={20}>20 mi</option>
            </select>
            <span className="text-white/40 text-xs">• {filtered.length} posts</span>
            <div className="ml-auto flex items-center gap-2">
              <GoLive userId={currentUserId || undefined} zipCode={displayZip || 'GLOBAL'} city={displayCity} />
              <span className="bg-green-500 text-black px-2.5 py-1 rounded-full text-xs font-bold">LIVE</span>
            </div>
          </div>

          <div className="mt-2"><Safe loader={() => import('@/components/LiveNowStrip')} name="LiveNowStrip" /></div>
          <div className="mt-4"><Safe loader={() => import('@/components/CreatePost')} name="CreatePost" /></div>
          <div className="mt-2 text-xs text-white/40 px-1">Posting as {authorName} • {isGlobal? displayCity : displayZip} • {radius}mi</div>

          <div className="flex gap-2 overflow-x-auto py-3 mt-2 -mx-1 px-1">
            {FILTERS.map(f=>(
              <button key={f.id} onClick={()=>handleFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 ${filter===f.id?'bg-white text-black border-white':'bg-white/10 text-white border-white/20'}`}>{f.label}</button>
            ))}
          </div>

          <div className="space-y-3 mt-2">
            {filtered.length===0 && <WelcomePost />}
            {filtered.map((p:any)=>(
              <div key={p.id} className="bg-white rounded-2xl p-5 border-l-4 shadow-xl break-words">
                <p className="text-black whitespace-pre-wrap break-words leading-6">{p.body || p.content}</p>
                {p.media_url && p.media_type==='video' && <video src={p.media_url} controls className="mt-3 w-full rounded-xl bg-black" />}
                {p.media_url && p.media_type==='image' && <img src={p.media_url} alt="" className="mt-3 w-full rounded-xl" />}
                <div className="mt-2 text-xs text-gray-400">{new Date(p.created_at).toLocaleString()} • {p.zip_code || displayZip}</div>
                {currentUserId && p.user_id === currentUserId && <button onClick={()=>deletePost(p.id)} className="mt-2 bg-red-100 text-red-600 rounded-full px-3 py-1 text-xs font-bold">Delete</button>}
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
      <GlobalFooter />
    </>
  )
}

export default function FeedPage() {
  return <Suspense fallback={<div className="text-white p-10 text-center">Loading feed...</div>}><FeedContent /></Suspense>
}
