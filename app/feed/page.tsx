'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

type Post = {
  id: string
  user_id: string
  body: string
  tag: Tag
  boosted_until: string | null
  created_at: string
  media_url: string | null
  media_type: string | null
  display_name: string
  is_pro: boolean
  hearts: number
  liked: boolean
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [filter, setFilter] = useState<Tag | 'All'>('All')
  const [err, setErr] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setUser(data.user)
      setLoading(false)
    })
  }, [router, supabase])

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data: postRows } = await supabase.from('posts').select('id, user_id, body, tag, boosted_until, created_at, media_url, media_type').order('created_at', { ascending: false }).limit(200)
    if (!postRows) return
    const userIds = [...new Set(postRows.map((p) => p.user_id))]
    const { data: profs } = await supabase.from('public_profiles').select('user_id, display_name, is_pro').in('user_id', userIds)
    const profMap = new Map((profs?? []).map((p: any) => [p.user_id, p]))
    const { data: likes } = await supabase.from('post_likes').select('post_id, user_id')
    const counts = new Map<string, number>()
    const myLiked = new Set<string>()
    ;(likes?? []).forEach((l: any) => {
      counts.set(l.post_id, (counts.get(l.post_id)?? 0) + 1)
      if (user && l.user_id === user.id) myLiked.add(l.post_id)
    })
    const merged: Post[] = postRows.map((p: any) => ({
     ...p,
      display_name: profMap.get(p.user_id)?.display_name?? 'Neighbor',
      is_pro: profMap.get(p.user_id)?.is_pro?? false,
      hearts: counts.get(p.id)?? 0,
      liked: myLiked.has(p.id),
    }))
    setPosts(merged)
  }

  const pickMedia = (f: File | null) => {
    setErr('')
    if (!f) { setMediaFile(null); setMediaPreview(null); return }
    setMediaFile(f)
    setMediaPreview(URL.createObjectURL(f))
  }

  const submit = async () => {
    setErr('')
    const text = draft.trim()
    if ((!text &&!mediaFile) ||!user) return
    setUploading(true)
    try {
      let media_url: string | null = null
      let media_type: string | null = null
      if (mediaFile) {
        const ext = mediaFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('post-media').upload(path, mediaFile)
        if (upErr) { setErr(upErr.message); return }
        const { data: pub } = supabase.storage.from('post-media').getPublicUrl(path)
        media_url = pub.publicUrl
        media_type = mediaFile.type.startsWith('video/')? 'video' : 'image'
      }
      await supabase.from('posts').insert({ user_id: user.id, body: text, tag, media_url, media_type })
      setDraft(''); setTag('General'); setMediaFile(null); setMediaPreview(null)
      load()
    } finally { setUploading(false) }
  }

  const like = async (postId: string, alreadyLiked: boolean) => {
    if (!user) return
    if (alreadyLiked) await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    else await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    load()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>

  const scoped = filter === 'All'? posts : posts.filter((p) => p.tag === filter)

  return (
    <div className="min-h-screen bg-[#0f0a05] relative">
      <div className="fixed inset-0 bg-[url('/bg-hearts.jpg')] bg-cover bg-center opacity-40 pointer-events-none" />
      <div className="relative min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto p-4 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/90 backdrop-blur-md p-4 shadow-xl">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's happening on your block?"
              rows={3}
              maxLength={2000}
              className="w-full resize-none rounded-2xl bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 outline-none border-2 border-blue-100 focus:border-blue-400"
            />
            {mediaPreview && (
              <div className="mt-3 relative inline-block">
                {mediaFile?.type.startsWith('video/')? <video src={mediaPreview} controls className="max-h-64 rounded-2xl" /> : <img src={mediaPreview} alt="Preview" className="max-h-64 rounded-2xl" />}
                <button type="button" onClick={() => pickMedia(null)} className="absolute -right-2 -top-2 rounded-full bg-black text-white px-2 py-0.5 text-xs">×</button>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1">
                <label className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200">
                  📷 Photo / Video
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => pickMedia(e.target.files?.[0]?? null)} />
                </label>
                {TAGS.map((t) => (
                  <button key={t} onClick={() => setTag(t)} className={`rounded-full px-3 py-1 text-xs font-bold ${tag === t? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t}</button>
                ))}
              </div>
              <button onClick={submit} disabled={uploading || (!draft.trim() &&!mediaFile)} className="rounded-full px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow">
                {uploading? 'Posting…' : 'Post'}
              </button>
            </div>
            {err && <p className="mt-2 text-sm text-red-600 font-bold">{err}</p>}
          </div>

          <div className="flex flex-wrap gap-1">
            {(['All',...TAGS] as const).map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-3 py-1 text-xs font-bold ${filter === t? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>{t}</button>
            ))}
          </div>

          <ul className="space-y-3">
            {scoped.map((p) => (
              <li key={p.id} className="rounded-3xl border border-white/10 bg-white/90 backdrop-blur-md p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">{p.display_name} <span className="text-xs text-gray-500 font-normal">· {timeAgo(p.created_at)} ago</span></div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{p.tag}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-900">{p.body}</p>
                {p.media_url && <div className="mt-3 overflow-hidden rounded-2xl border bg-white">{p.media_type === 'video'? <video src={p.media_url} controls className="max-h-96 w-full" /> : <img src={p.media_url} alt="Post" className="max-h-96 w-full object-contain" />}</div>}
                <button onClick={() => like(p.id, p.liked)} className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${p.liked? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p.liked? '❤' : '♥'} {p.hearts}</button>
              </li>
            ))}
            {scoped.length === 0 && <li className="rounded-3xl border border-white/20 bg-black/40 backdrop-blur-md p-8 text-center text-white font-bold">No posts yet. Be the first to share what's happening.</li>}
          </ul>
        </main>
      </div>
    </div>
  )
}
