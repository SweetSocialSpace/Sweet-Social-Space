'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

type Post = {
  id: string
  body: string
  tag: Tag
  created_at: string
  zip_code: string
  user_id: string
}

const TAG_STYLES: Record<Tag, string> = {
  "General": "bg-zinc-900 text-white",
  "Alert": "bg-red-600 text-white",
  "Recommendation": "bg-emerald-600 text-white",
  "Free stuff": "bg-violet-600 text-white",
  "Hot take": "bg-orange-500 text-white",
  "Lost & found": "bg-blue-600 text-white",
}

export default function FeedPage() {
  const supabase = createClient()
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [posts, setPosts] = useState<Post[]>([])
  const [zip, setZip] = useState('95122')
  const [radius, setRadius] = useState<'10'|'20'>('10')
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

    if (!error && data) setPosts(data as Post[])
    setLoading(false)
  }, [supabase, zip])

  useEffect(() => {
    fetchPosts()
    const channel = supabase
    .channel('feed-posts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => setPosts(prev => [payload.new as Post,...prev].slice(0,100))
      )
    .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchPosts, supabase])

  const submit = async () => {
    if (!draft.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in to post')
      return
    }
    const newPost = {
      user_id: user.id,
      body: draft.trim(),
      tag,
      zip_code: zip,
    }
    setDraft('')
    const { error } = await supabase.from('posts').insert(newPost)
    if (error) {
      console.error(error)
      alert(error.message)
      setDraft(newPost.body)
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[360px_1fr_380px] gap-6 items-start">
        <div className="space-y-4 sticky top-6">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
            <p className="font-bold">📌 PINNED ALERT</p>
            <p className="text-sm mt-2 text-white/80">No emergencies in {zip}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
            <p className="font-bold">What's Happening Near You</p>
            <p className="text-xs mt-2 text-white/60">Within {radius} miles of {zip}</p>
          </div>
        </div>
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-5">
          <div className="bg-white rounded-full p-2 flex items-center gap-2 mb-4">
            <span className="font-black text-black text-sm pl-3">NEAR:</span>
            <input
              value={zip}
              onChange={e=>setZip(e.target.value.replace(/\D/g,'').slice(0,5))}
              className="border-2 border-black rounded-full px-3 py-1 font-black text-sm w-20 bg-white text-black outline-none"
            />
            <select value={radius} onChange={e=>setRadius(e.target.value as any)} className="border-2 border-black rounded-full px-3 py-1 font-black text-sm bg-white text-black">
              <option value="10">10 miles</option>
              <option value="20">20 miles</option>
            </select>
            <span className="ml-auto pr-3 text-xs font-black text-black">San Jose, CA • {zip}</span>
          </div>
          <div className="bg-black text-white rounded-full py-2.5 text-center font-black text-xs mb-5">
            🔴 LIVE NOW: {posts.length} posts within {radius} miles
          </div>
          <div className="bg-white rounded-2xl p-5 mb-6">
            <textarea
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              placeholder="What's happening in your area?"
              className="w-full min-h- text-black p-4 border border-black/10 rounded-xl text-base outline-none resize-none"
              maxLength={500}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map(t=>(
                <button key={t} onClick={()=>setTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black border-2 transition ${tag===t? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-black/5'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-black/40">{draft.length}/500</span>
              <button onClick={submit} disabled={!draft.trim()} className="bg-blue-600 disabled:opacity-40 text-white font-black px-8 py-3 rounded-full">
                POST AS {tag.toUpperCase()}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {loading? <p className="text-white/60 text-center py-10">Loading feed...</p> :
             posts.map(p=>(
              <div key={p.id} className="bg-white rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-black px-2 py-1 rounded-full ${TAG_STYLES[p.tag as Tag] || TAG_STYLES.General}`}>{p.tag}</span>
                  <span className="text-xs text-black/40">{new Date(p.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-black whitespace-pre-wrap leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 sticky top-6">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
            <p className="font-bold">Marketplace</p><p className="text-xs mt-1 text-white/60">Free stuff near {zip}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
            <p className="font-bold">Business Directory</p><p className="text-xs mt-1 text-white/60">Shops within 20 miles</p>
          </div>
        </div>
      </div>
    </>
  )
}
