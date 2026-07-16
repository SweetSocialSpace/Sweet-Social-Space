'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [uploading, setUploading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const baseTextRef = useRef('')

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])
  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setPosts(data)
  }

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Voice not supported in this browser. Use Chrome."); return }

    if (isListening) {
      ;(window as any)._recognition?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SR()
    ;(window as any)._recognition = recognition
    recognition.continuous = false // FIX: one sentence at a time, no tripling
    recognition.interimResults = false // FIX: only final result
    recognition.lang = 'en-US'

    baseTextRef.current = draft
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      let text = event.results[0][0].transcript.trim()
      // Say the punctuation out loud
      text = text.replace(/\s*period$/i, '.').replace(/\s*question mark$/i, '?').replace(/\s*exclamation point$/i, '!').replace(/\s*comma$/i, ',')
      // Replace words anywhere too
      text = text.replace(/ period /gi, '. ').replace(/ question mark /gi, '? ').replace(/ comma /gi, ', ').replace(/ exclamation point /gi, '! ')

      setDraft((baseTextRef.current? baseTextRef.current + ' ' : '') + text + ' ')
    }

    recognition.start()
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
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What's happening? Tap mic to talk..." rows={4} className="w-full rounded-xl bg-white border-2 border-gray-200 focus:border-blue-500 p-4 pr-14 text-black placeholder:text-gray-500 outline-none" />
              <button type="button" onClick={toggleMic} className={`absolute right-2 top-2 rounded-full w-10 h-10 flex items-center justify-center shadow font-bold border-2 ${isListening? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-gray-900 text-white border-black'}`}>{isListening? '■' : '🎤'}</button>
            </div>
            <p className="mt-2 text- font-bold ${isListening? 'text-red-600' : 'text-gray-500'}">{isListening? '🔴 Listening... speak now, then it stops automatically' : '🎤 Tap mic, say one sentence, it types it once — say "period" for. "question mark" for?'}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">POST AS:</span>
              <select value={tag} onChange={(e) => setTag(e.target.value as Tag)} className="rounded-full border-2 border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-black">{TAGS.map(t => <option key={t} value={t}>{t}</option>)}</select>
            </div>
            <button onClick={submit} disabled={uploading ||!draft.trim()} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-full shadow">POST AS {tag.toUpperCase()}</button>
          </div>
          <div className="bg-black/30 backdrop-blur rounded-2xl border border-white/10 p-6 text-center text-white font-bold">No posts yet. Be the first to share.</div>
        </div>
      </main>
    </div>
  )
}
