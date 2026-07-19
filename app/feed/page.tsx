'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// HEADER is in app/components - everything else is in root components
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

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

export default function FeedPage() {
  const supabase = createClient()
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [posts, setPosts] = useState<any[]>([])
  const [listening, setListening] = useState(false)
  const [radius, setRadius] = useState(5)
  const [zip, setZip] = useState('95122')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // REQUIRE PROFILE GATE - no profile = no feed
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

  useEffect(()=>{
    (async()=>{
      const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
      if(data) setPosts(data)
    })()
  }, [])

  const toggleMic = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) { alert('Mic not supported in this browser'); return }
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setDraft(prev => prev? prev + ' ' + text : text)
    }
    rec.start()
  }

  const submit = async ()=>{
    if(!draft.trim()) return
    const { data:{ user } } = await supabase.auth.getUser()
    if(!user) return
    await supabase.from('posts').insert({ user_id:user.id, body:draft, tag })
    setDraft('')
    const { data } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100)
    if(data) setPosts(data)
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post? Neighbors won\'t see it anymore.')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      setPosts(prev => prev.filter(p => p.id!== postId))
    }
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
          <div className="bg-white rounded-2xl p-5 mb-6 mt-4">
            <div className="flex gap-2">
              <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Tap mic and talk — I keep everything, even when you pause..." className="w-full min-h- text-black p-3 border rounded-xl flex-1" />
              <button onClick={toggleMic} className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-black ${listening? 'bg-red-600 animate-pulse' : 'bg-black text-white'}`}>🎤</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{TAGS.map(t=><button key={t} onClick={()=>setTag(t)} className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${tag===t?'bg-black text-white':'bg-white text-black border-black'}`}>{t}</button>)}</div>
            <button onClick={submit} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>
          <div className="space-y-4">
            {posts.map(p=>(
              <div key={p.id} className="bg-white rounded-2xl p-5 overflow-hidden relative">
                <div className="flex justify-between items-start gap-3">
                  <p className="text-black whitespace-pre-wrap break-words [overflow-wrap:anywhere] flex-1">{p.body}</p>
                  {currentUserId && p.user_id === currentUserId && (
                    <button
                      onClick={()=>deletePost(p.id)}
                      className="bg-red-100 hover:bg-red-600 hover:text-white text-red-600 rounded-full px-3 py-1 text-xs font-black border border-red-300 shrink-0"
                      title="Delete your post"
                    >
                      🗑️ DELETE
                    </button>
                  )}
                </div>
                <div className="mt-2 text- font-bold text-gray-400">{p.tag} • {new Date(p.created_at).toLocaleString()}</div>
              </div>
            ))}
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
