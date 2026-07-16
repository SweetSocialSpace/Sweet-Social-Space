'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

// This makes your talking turn into real sentences automatically
function smartPunctuate(text: string) {
  if (!text) return ''
  let t = text.trim().toLowerCase()

  // Fix common run-on breaks - put a period before these starters
  t = t.replace(/\s+(i hope|i think|i want|have you|do you|what's|what is|where is|can you|we all|or what)\s+/g, (m, p1) => `. ${p1} `)

  // Split into pieces
  let sentences = t.split(/[.]\s*/).filter(Boolean)
  let out = sentences.map(s => {
    s = s.trim()
    if (!s) return ''
    // Capitalize first letter
    s = s.charAt(0).toUpperCase() + s.slice(1)
    // Is it a question?
    if (/^(how are|how is|what|where|who|when|why|have you|do you|can you|what's|are you|is there)/i.test(s)) {
      return s.endsWith('?')? s : s + '?'
    }
    return s.endsWith('.') || s.endsWith('?') || s.endsWith('!')? s : s + '.'
  })

  return out.join(' ').replace(/\s+/g, ' ').trim() + ' '
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [uploading, setUploading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])
  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setPosts(data)
  }

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome"); return }
    if (isListening) { (window as any)._recognition?.stop(); setIsListening(false); return }

    const rec = new SR()
    ;(window as any)._recognition = rec
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onresult = (e: any) => {
      let spoken = e.results[0][0].transcript
      let fixed = smartPunctuate(spoken)
      setDraft(prev => prev? prev.trimEnd() + ' ' + fixed : fixed)
    }
    rec.start()
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    setUploading(true)
    await supabase.from('posts').insert({ user_id: user.id, body: draft.trim(), tag })
    setDraft(''); load(); setUploading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10 p-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <div className="relative">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tap mic and just talk normal..." rows={5} className="w-full rounded-xl bg-white border-2 border-gray-200 focus:border-blue-500 p-4 pr-14 text-black placeholder:text-gray-500 outline-none" />
              <button type="button" onClick={toggleMic} className={`absolute right-2 top-2 rounded-full w-11 h-11 flex items-center justify-center shadow text-xl ${isListening? 'bg-red-600 animate-pulse' : 'bg-black'} text-white`}>{isListening? '■' : '🎤'}</button>
            </div>
            <p className="mt-2 text-xs font-bold text-gray-600">{isListening? '🔴 Listening — just talk normal' : '🎤 Tap mic and talk normal — I add the . and ? for you'}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">POST AS:</span>
              <select value={tag} onChange={(e) => setTag(e.target.value as Tag)} className="rounded-full border-2 border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-black">{TAGS.map(t => <option key={t} value={t}>{t}</option>)}</select>
            </div>
            <button onClick={submit} disabled={uploading ||!draft.trim()} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>
          <div className="bg-black/30 backdrop-blur rounded-2xl border border-white/10 p-6 text-center text-white font-bold">No posts yet. Be the first to share.</div>
        </div>
      </main>
    </div>
  )
}
