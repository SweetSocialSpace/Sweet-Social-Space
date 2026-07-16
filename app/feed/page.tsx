'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [filter, setFilter] = useState<Tag | 'All'>('All')
  const [uploading, setUploading] = useState(false)

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])
  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setPosts(data)
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    setUploading(true)
    await supabase.from('posts').insert({ user_id: user.id, body: draft, tag })
    setDraft(''); load(); setUploading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>
  const scoped = filter === 'All'? posts : posts.filter((p:any) => p.tag === filter)

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        {/* Outer - SAME as About page - see-through smoky */}
        <div className="bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10 p-3 space-y-4">

          {/* Inner - NOW WHITE so you can read it - like Login box */}
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's happening on your block?"
              rows={4}
              className="w-full rounded-xl bg-white border-2 border-gray-200 focus:border-blue-500 p-4 text-black text-base placeholder:text-gray-500 outline-none"
              style={{ color: '#000' }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button key={t} onClick={() => setTag(t)} className={`px-3 py-1 rounded-full text-xs font-bold border ${tag===t?'bg-black text-white border-black':'bg-white text-black border-gray-300'}`}>{t}</button>
              ))}
            </div>
            <button onClick={submit} disabled={uploading ||!draft.trim()} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-full shadow text-base">
              {uploading? 'Posting...' : 'POST'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['All',...TAGS] as const).map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-xs font-bold border ${filter===t?'bg-white text-black border-white':'bg-black/30 text-white border-white/20'}`}>{t}</button>
            ))}
          </div>

          <div className="bg-black/30 backdrop-blur rounded-2xl border border-white/10 p-6 text-center text-white font-bold">
            No posts yet. Be the first to share what's happening.
          </div>

        </div>
      </main>
    </div>
  )
}
