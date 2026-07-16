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
  const recognitionRef = useRef<any>(null)

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])
  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setPosts(data)
  }

  // --- TALK TO TEXT ---
  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice typing. Try Chrome on your phone or computer.")
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' '
      }

      // Smart punctuation - when you SAY the word, it types the symbol
      transcript = transcript
       .replace(/\s*period\s*/gi, '. ')
       .replace(/\s*question mark\s*/gi, '? ')
       .replace(/\s*exclamation point\s*/gi, '! ')
       .replace(/\s*comma\s*/gi, ', ')
       .replace(/\s*new line\s*/gi, '\n')

      setDraft(prev => {
        // If it's still listening (interim), replace last part, otherwise append
        return prev + ' ' + transcript
      })
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    setUploading(true)
    await supabase.from('posts').insert({ user_id: user.id, body: draft, tag })
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
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What's happening on your block? Tap the mic to talk..." rows={4} className="w-full rounded-xl bg-white border-2 border-gray-200 focus:border-blue-500 p-4 pr-14 text-black placeholder:text-gray-500 outline-none" />

              {/* MICROPHONE BUTTON - text to talk */}
              <button type="button" onClick={toggleMic} title="Click to speak" className={`absolute right-2 top-2 rounded-full w-10 h-10 flex items-center justify-center text-lg shadow font-bold ${isListening? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}>
                {isListening? '■' : '🎤'}
              </button>
            </div>

            <p className="mt-2 text- text-gray-500 font-medium">
              {isListening? '🔴 Listening... say "period" for. "question mark" for?' : '🎤 Tap mic for text-to-talk — say "comma", "period", "question mark" out loud'}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">POST AS:</span>
              <select value={tag} onChange={(e) => setTag(e.target.value as Tag)} className="rounded-full border-2 border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-black">
                {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={submit} disabled={uploading ||!draft.trim()} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-full shadow">POST AS {tag.toUpperCase()}</button>
          </div>

          <div className="bg-black/30 backdrop-blur rounded-2xl border border-white/10 p-6 text-center text-white font-bold">
            No posts yet. Be the first to share what's happening.
          </div>

        </div>
      </main>
    </div>
  )
}
