'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Header from '@/app/components/Header'
import MicRecorder from '@/components/mic/MicRecorder'
import { LocationScopeBar } from '@/components/LocationScopeBar'
import { EmergencyAlerts } from '@/components/EmergencyAlerts'
import { LatestAlerts } from '@/components/LatestAlerts'
import { WhatsHappeningNearYou } from '@/components/WhatsHappeningNearYou'
import { LiveNowStrip } from '@/components/LiveNowStrip'
import { PinnedAutomatedAlert } from '@/components/PinnedAutomatedAlert'
import { MarketplacePreview } from '@/components/MarketplacePreview'
import { BusinessDirectory } from '@/components/BusinessDirectory'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import { VerifiedSources } from '@/components/VerifiedSources'
import { MobileBottomNav } from '@/components/MobileBottomNav'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [preview, setPreview] = useState<string|null>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setUser(data.user)
      setLoading(false)
    })
    loadPosts()
  }, [])

  const loadPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50)
    if (data) setPosts(data)
  }

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const submit = async () => {
    const textToPost = draft.trim()
    if (!textToPost ||!user) return
    try { (window as any)._keepListening = false; (window as any)._recog?.stop() } catch {}
    const { error } = await supabase.from('posts').insert({ user_id: user.id, body: textToPost, tag })
    if (error) { alert("Post failed: " + error.message); return }
    setDraft(''); setPreview(null); loadPosts()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>
  }

  return (
    <div className="min-h-screen w-full bg-[#0f172a]">
      <Header />

      <div className="max-w- mx-auto px-4 pt-4">
        <LocationScopeBar />
      </div>

      <div className="max-w- mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[320px_1fr_360px] gap-4">
        <aside className="space-y-4 order-2 lg:order-1">
          <PinnedAutomatedAlert />
          <EmergencyAlerts />
          <LatestAlerts />
          <WhatsHappeningNearYou />
        </aside>

        <main className="space-y-4 order-1 lg:order-2">
          <LiveNowStrip />
          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <MicRecorder value={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center gap-3">
              <label className="bg-black text-white border-2 border-black font-black rounded-full px-5 py-2.5 text-sm cursor-pointer shadow">
                📷 Add Picture / Video
                <input type="file" accept="image/*,video/*" onChange={onPickFile} className="hidden" />
              </label>
              {preview && (
                <div className="flex items-center gap-2">
                  <img src={preview} alt="preview" className="w-16 h-16 rounded-xl object-cover border-2 border-black" />
                  <button type="button" onClick={()=>setPreview(null)} className="text-sm font-black text-red-600">Remove</button>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-xs font-black text-black mb-2">POST AS:</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(t => (
                  <button type="button" key={t} onClick={()=>setTag(t)} className={`px-4 py-2 rounded-full text-sm font-black border-2 ${tag===t? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-gray-100'}`}>{t}</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={submit} className="mt-5 w-full bg-blue-600 text-white font-black py-3.5 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>

          <div className="space-y-3">
            {posts.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full">{p.tag || 'General'}</span>
                  <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span>
                </div>
                <p className="text-black text- whitespace-pre-wrap leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </main>

        <aside className="space-y-4 order-3">
          <MarketplacePreview />
          <BusinessDirectory />
          <UpcomingEvents />
          <VerifiedSources />
        </aside>
      </div>

      <MobileBottomNav />
    </div>
  )
}
