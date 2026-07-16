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
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setUser(data.user)
      setLoading(false)
    })
  }, [router, supabase])

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setPosts(data)
  }

  const submit = async () => {
    if (!draft.trim() &&!mediaFile) return
    setUploading(true)
    const { error } = await supabase.from('posts').insert({ user_id: user.id, body: draft, tag })
    if (!error) { setDraft(''); load() }
    else setErr(error.message)
    setUploading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0806]">
      <Header />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-xl border border-white/50">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's happening on your block?"
            rows={3}
            className="w-full rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 p-4 text-gray-900 placeholder:text-gray-500 outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {TAGS.map(t => (
              <button key={t} onClick={() => setTag(t)} className={`px-3 py-1 rounded-full text-xs font-bold ${tag===t? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>{t}</button>
            ))}
          </div>
          <button onClick={submit} disabled={uploading ||!draft.trim()} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-full text-base shadow">
            {uploading? 'Posting...' : 'POST'}
          </button>
          {err && <p className="text-red-600 text-sm mt-2 font-bold">{err}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['All',...TAGS] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-xs font-bold border ${filter===t? 'bg-white text-black' : 'bg-black/40 text-white border-white/20'}`}>{t}</button>
          ))}
        </div>

        <div className="rounded-2xl bg-black/40 backdrop-blur border border-white/10 p-6 text-center text-white font-bold">
          No posts yet. Be the first to share what's happening.
        </div>
      </main>
    </div>
  )
}
