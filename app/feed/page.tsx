'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

const REACTIONS = ["❤", "😂", "😮", "😢", "👏", "🔥"] as const

type Post = {
  id: string
  user_id: string
  body: string
  tag: Tag
  boosted_until: string | null
  created_at: string
  media_url: string | null
  media_type: string | null
  latitude: number | null
  longitude: number | null
  state_code: string | null
  country_code: string | null
  zip_code: string | null
  display_name: string
  is_pro: boolean
  hearts: number
  reactions: Record<string, number>
  myReactions: Set<string>
  liked: boolean
  comment_count: number
}

type Scope = "5 mi" | "20 mi" | "50 mi" | "State" | "Nationwide" | "Trending" | "Following"
const SCOPES: Scope[] = ["5 mi", "20 mi", "50 mi", "State", "Nationwide", "Trending", "Following"]

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

  useEffect(() => {
    if (!user) return
    load()
  }, [user])

  const load = async () => {
    const { data: postRows } = await supabase
   .from('posts')
   .select('id, user_id, body, tag, boosted_until, created_at, media_url, media_type, latitude, longitude, state_code, country_code, zip_code')
   .order('created_at', { ascending: false })
   .limit(200)
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

    const { data: cmtRows } = await supabase.from('post_comments').select('post_id')
    const cmtCounts = new Map<string, number>()
    ;(cmtRows?? []).forEach((c: any) => {
      cmtCounts.set(c.post_id, (cmtCounts.get(c.post_id)?? 0) + 1)
    })

    const now = Date.now()
    const merged: Post[] = postRows.map((p: any) => ({
   ...p,
      display_name: profMap.get(p.user_id)?.display_name?? 'Neighbor',
      is_pro: profMap.get(p.user_id)?.is_pro?? false,
      hearts: counts.get(p.id)?? 0,
      reactions: {},
      myReactions: new Set<string>(),
      liked: myLiked.has(p.id),
      comment_count: cmtCounts.get(p.id)?? 0,
    }))

    merged.sort((a, b) => {
      const aB = a.boosted_until && new Date(a.boosted_until).getTime() > now? 1 : 0
      const bB = b.boosted_until && new Date(b.boosted_until).getTime() > now? 1 : 0
      if (aB!== bB) return bB - aB
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    setPosts(merged)
  }

  const pickMedia = (f: File | null) => {
    setErr('')
    if (!f) { setMediaFile(null); setMediaPreview(null); return }
    const isImg = f.type.startsWith('image/')
    const isVid = f.type.startsWith('video/')
    if (!isImg &&!isVid) { setErr('Only image or video files are allowed.'); return }
    const maxBytes = isVid? 50 * 1024 : 10 * 1024 * 1024
    if (f.size > maxBytes) { setErr(isVid? 'Video must be under 50 MB.' : 'Image must be under 10 MB.'); return }
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
        const ext = mediaFile.name.split('.').pop()?.toLowerCase() || (mediaFile.type.startsWith('video/')? 'mp4' : 'jpg')
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: upErr } = await supabase.storage.from('post-media').upload(path, mediaFile, {
          contentType: mediaFile.type,
          upsert: false,
        })
        if (upErr) { setErr(upErr.message); return }
        const { data: pub } = supabase.storage.from('post-media').getPublicUrl(path)
        media_url = pub.publicUrl
        media_type = mediaFile.type.startsWith('video/')? 'video' : 'image'
      }
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        body: text,
        tag,
        media_url,
        media_type,
      })
      if (error) { setErr(error.message); return }
      setDraft(''); setTag('General')
      if (mediaPreview) URL.revokeObjectURL(mediaPreview)
      setMediaFile(null); setMediaPreview(null)
      load()
    } finally {
      setUploading(false)
    }
  }

  const like = async (postId: string, alreadyLiked: boolean) => {
    if (!user) return
    if (alreadyLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    }
    load()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>

  const scoped = filter === 'All'? posts : posts.filter((p) => p.tag === filter)

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's happening on your block?"
          rows={3}
          maxLength={2000}
          className="w-full resize-none rounded-2xl bg-background px-4 py-3 text-base outline-none focus:bg-muted"
        />
        {mediaPreview && (
          <div className="mt-3 relative inline-block">
            {mediaFile?.type.startsWith('video/')? (
              <video src={mediaPreview} controls className="max-h-64 rounded-2xl" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="max-h-64 rounded-2xl" />
            )}
            <button
              type="button"
              onClick={() => pickMedia(null)}
              className="absolute -right-2 -top-2 rounded-full bg-foreground px-2 py-0.5 text-xs text-background"
            >
              ×
            </button>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            <label className="cursor-pointer rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-muted">
              📷 Photo / Video
              <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => pickMedia(e.target.files?.[0]?? null)} />
            </label>
            {TAGS.map((t) => (
              <button key={t} onClick={() => setTag(t)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${tag === t? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={submit} disabled={uploading || (!draft.trim() &&!mediaFile)} className="rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground transition disabled:opacity-50" style={{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-sweet)' }}>
            {uploading? 'Posting…' : 'Post'}
          </button>
        </div>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </div>

      <div className="flex flex-wrap gap-1">
        {(['All',...TAGS] as const).map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${filter === t? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {scoped.map((p) => {
          const boosted = p.boosted_until && new Date(p.boosted_until).getTime() > Date.now()
          const mine = p.user_id === user?.id
          return (
            <li key={p.id} className={`rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)] ${boosted? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}>
              {boosted && <div className="mb-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">📌 Boosted</div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full" style={{ background: 'var(--gradient-warm)' }} />
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      {p.display_name}
                      {p.is_pro && <span className="rounded bg-foreground/90 px-1.5 py-0.5 text-xs font-bold text-background">PRO</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{timeAgo(p.created_at)} ago</div>
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{p.tag}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{p.body}</p>
              {p.media_url && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-muted">
                  {p.media_type === 'video'? (
                    <video src={p.media_url} controls playsInline className="max-h-96 w-full" />
                  ) : (
                    <img src={p.media_url} alt="Post" loading="lazy" className="max-h-96 w-full object-contain" />
                  )}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <button
                  onClick={() => like(p.id, p.liked)}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition active:scale-95 ${p.liked? 'bg-primary/10 text-primary' : 'bg-secondary hover:bg-muted'}`}
                >
                  <span aria-hidden className="text-base leading-none">{p.liked? '❤' : '♥'}</span> {p.hearts}
                </button>
                {mine && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this post? This cannot be undone.')) return
                      const { error } = await supabase.from('posts').delete().eq('id', p.id)
                      if (!error) load()
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          )
        })}
        {scoped.length === 0 && (
          <li className="rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">
            No posts yet. Be the first to share what's happening.
          </li>
        )}
      </ul>
    </div>
  )
}
