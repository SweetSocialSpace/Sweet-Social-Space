'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

type Post = { id: string, user_id: string, body: string, tag: Tag, created_at: string, media_url: string | null, media_type: string | null, display_name: string, hearts: number, liked: boolean }

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
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])
  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data: postRows } = await supabase.from('posts').select('id, user_id, body, tag, created_at, media_url, media_type').order('created_at', { ascending: false }).limit(200)
    if (!postRows) return
    const userIds = [...new Set(postRows.map((p) => p.user_id))]
    const { data: profs } = await supabase.from('public_profiles').select('user_id, display_name').in('user_id', userIds)
    const profMap = new Map((profs?? []).map((p: any) => [p.user_id, p]))
    const { data: likes } = await supabase.from('post_likes').select('post_id, user_id')
    const counts = new Map<string, number>(); const myLiked = new Set<string>()
    ;(likes?? []).forEach((l: any) => { counts.set(l.post_id, (counts.get(l.post_id)?? 0)+1); if (user && l.user_id === user.id) myLiked.add(l.post_id) })
    setPosts(postRows.map((p: any) => ({...p, display_name: profMap.get(p.user_id)?.display_name?? 'Neighbor', hearts: counts.get(p.id)?? 0, liked: myLiked.has(p.id) })))
  }

  const submit = async () => {
    const text = draft.trim(); if ((!text &&!mediaFile) ||!user) return; setUploading(true)
    try {
      let media_url: string | null = null; let media_type: string | null = null
      if (mediaFile) {
        const path = `${user.id}/${Date.now()}.${mediaFile.name.split('.').pop()}`; await supabase.storage.from('post-media').upload(path, mediaFile)
        const { data: pub } = supabase.storage.from('post-media').getPublicUrl(path); media_url = pub.publicUrl; media_type = mediaFile.type.startsWith('video/')? 'video':'image'
      }
      await supabase.from('posts').insert({ user_id: user.id, body: text, tag, media_url, media_type })
      setDraft(''); setMediaFile(null); setMediaPreview(null); load()
    } finally { setUploading(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>
  const scoped = filter === 'All'? posts : posts.filter((p) => p.tag === filter)

  return (
    <div className="min-h-screen w-full">
      <Header />
      {/* THIS IS THE SAME SMOKY BOX YOU HAVE ON ABOUT / PRIVACY */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-3 space-y-4">

          {/* Composer - white so you can read it */}
          <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What's happening on your block?" rows={3} className="w-full resize-none rounded-xl bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none border-2 border-blue-100 focus:border-blue-400" />
            {mediaPreview && <div className="mt-2"><img src={mediaPreview} className="max-h-64 rounded-xl" /></div>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">📷 Photo / Video<input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]){ setMediaFile(e.target.files[0]); setMediaPreview(URL.createObjectURL(e.target.files[0])) } }} /></label>
              {TAGS.map((t) => <button key={t} onClick={() => setTag(t)} className={`rounded-full px-3 py-1 text-xs font-bold ${tag===t?'bg-gray-900 text-white':'bg-gray-100 text-gray-700'}`}>{t}</button>)}
              <button onClick={submit} disabled={uploading || (!draft.trim() &&!mediaFile)} className="ml-auto w-full md:w-auto mt-2 md:mt-0 rounded-full px-8 py-2.5 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow">POST</button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {(['All',...TAGS] as const).map((t) => <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-3 py-1 text-xs font-bold ${filter===t?'bg-white text-black border-white':'bg-white/10 text-white border-white/20'}`}>{t}</button>)}
          </div>

          {/* Posts */}
          <ul className="space-y-3">
            {scoped.map((p) => (
              <li key={p.id} className="rounded-2xl border border-white/10 bg-white/90 backdrop-blur p-4">
                <div className="flex justify-between text-sm"><span className="font-bold text-gray-900">{p.display_name}</span><span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-bold">{p.tag}</span></div>
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">{p.body}</p>
                <div className="mt-2 text-xs text-gray-500">{timeAgo(p.created_at)} ago · ♥ {p.hearts}</div>
              </li>
            ))}
            {scoped.length===0 && <li className="rounded-2xl border border-white/20 bg-black/40 backdrop-blur p-8 text-center text-white font-bold">No posts yet. Be the first to share what's happening.</li>}
          </ul>
        </div>
      </main>
    </div>
  )
}
