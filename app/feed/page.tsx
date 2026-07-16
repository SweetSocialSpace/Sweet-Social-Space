'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

function autoPunctuate(text: string) {
  let t = text.trim()
  if (!t) return ''
  t = t.charAt(0).toUpperCase() + t.slice(1)
  if (/[.!?]$/.test(t)) return t + ' '
  const isQuestion = /^(who|what|when|where|why|how|is|are|can|do|does|did|will|would|could|should|have|has|am|are you|is there)/i.test(t)
  return t + (isQuestion? '? ' : '. ')
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
  
  const baseTextRef = useRef('')
  const finalTranscriptRef = useRef('')

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])
  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setPosts(data)
  }

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome for voice"); return }

    const recognition = new SR()
    ;(window as any)._recognition = recognition
    recognition.continuous = true // stays on
    recognition.interimResults = true // shows as you talk but doesn't triple
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    
    recognition.onend = () => {
      // Auto-restart if user didn't hit stop — so it doesn't die when you pause
      if ((window as any)._shouldListen) {
        try { recognition.start() } catch {}
      } else {
        setIsListening(false)
      }
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += autoPunctuate(transcript)
        } else {
          interim += transcript
        }
      }
      // Show base + all final + current interim talking
      const full = baseTextRef.current + finalTranscriptRef.current + (interim? interim : '')
      setDraft(full)
    }

    recognition.start()
  }

  const toggleMic = () => {
    if (isListening) {
      ;(window as any)._shouldListen = false
      ;(window as any)._recognition?.stop()
      setIsListening(false)
      // save final
      baseTextRef.current = ''
      finalTranscriptRef.current = ''
    } else {
      ;(window as any)._shouldListen = true
      baseTextRef.current = draft? draft.trimEnd() + ' ' : ''
      finalTranscriptRef.current = ''
      startListening()
    }
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
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tap mic and talk... it keeps listening until you tap stop" rows={5} className="w-full rounded-xl bg-white border-2 border-gray-200 focus:border-blue-500 p-4 pr-14 text-black placeholder:text-gray-500 outline-none" />
              <button type="button" onClick={toggleMic} className={`absolute right-2 top-2 rounded-full w-12 h-12 flex items-center justify-center shadow font-black text-xl ${isListening? 'bg-red-600 text-white animate-pulse' : 'bg-black text-white'}`}>{isListening? '■' : '🎤'}</button>
            </div>
            <p className={`mt-2 text-xs font-bold ${isListening? 'text-red-600' : 'text-gray-500'}`}>
              {isListening? '🔴 KEEP TALKING — I stay on, auto adds . and ? — tap ■ when done' : '🎤 Tap mic once, talk as long as you want, tap stop when done'}
            </p>
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
