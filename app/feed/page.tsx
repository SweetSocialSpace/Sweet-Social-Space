'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { PinnedAutomatedAlert } from '@/components/PinnedAutomatedAlert'
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

export default function FeedPage() {
  const [filter, setFilter] = useState('all')
  const supabase = createClient()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [radius, setRadius] = useState(5)
  const [zip, setZip] = useState('95122')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const FILTERS = [
    { id: 'all', label: 'All 🌎' },
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
      } else if (profile.zip_code) {
        setZip(profile.zip_code)
      }
    })()
  }, [])

  useEffect(()=>{ fetchPosts() }, [])

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) setPosts(prev => prev.filter((p:any) => p.id!== postId))
  }

  const filtered = filter==='all'? posts : posts.filter((p:any)=> (p.category||p.tag?.toLowerCase())===filter)

  const catBadge = (cat: string) => {
    const map: any = { general:'😊', safety:'🚨', for_sale:'💰', free:'🎁', lost_pet:'🐶', event:'🎉', help:'🤝', recommend:'🌮', job:'💼' }
    return map[cat] || '📌'
  }

  return (
    <>
      <Header />
      <div className="max-w- mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[340px_1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <WeatherBar zip={zip} />
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </div>
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-5">
          <LocationScopeBar zip={zip} radius={radius} setRadius={setRadius} />
          <div className="mt-4"><LiveNowStrip /></div>

          {/* NEW ONE-STOP COMPOSER */}
          <div className="mt-4"><CreatePost onPosted={fetchPosts} /></div>

          {/* FILTER BAR - THIS IS THE ONE-STOP MAGIC */}
          <div className="flex gap-2 overflow-x-auto py-3 mt-2 -mx-1 px-1 scrollbar-hide">
            {FILTERS.map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap border-2 transition ${filter===f.id?'bg-white text-black border-white':'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>{f.label}</button>
            ))}
          </div>

          <div className="space-y-3 mt-2">
            {filtered.length===0 && <div className="text-white/40 text-center py-8 text-sm">No {filter} posts yet in 95122 - be first!</div>}
            {filtered.map((p:any)=>(
              <div key={p.id} className="bg-white rounded-2xl p-5 border-l-4" style={{borderLeftColor: p.category==='safety'?'#ef4444': p.category==='for_sale'?'#22c55e': p.category==='lost_pet'?'#f59e0b':'#000'}}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black bg-black text-white px-2 py-0.5 rounded-full">{catBadge(p.category||'general')} {(p.category||p.tag||'general').toUpperCase()}</span>
                      {p.price!=null && <span className="text-xs font-black bg-green-500 text-white px-2 py-0.5 rounded-full">${Number(p.price).toFixed(0)}</span>}
                      {p.condition && <span className="text- bg-gray-100 px-2 py-0.5 rounded-full">{p.condition}</span>}
                    </div>
                    <p className="text-black whitespace-pre-wrap break-words text-">{p.body}</p>
                  </div>
                  {currentUserId && p.user_id === currentUserId && (
                    <button onClick={()=>deletePost(p.id)} className="bg-red-100 hover:bg-red-600 hover:text-white text-red-600 rounded-full px-3 py-1 text-xs font-black border border-red-300">X</button>
                  )}
                </div>
                <div className="mt-2 text- font-bold text-gray-400">{new Date(p.created_at).toLocaleString()} • 95122</div>
              </div>
            ))}
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
