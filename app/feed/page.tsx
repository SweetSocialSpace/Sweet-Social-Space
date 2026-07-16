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
  const [isListening, setIsListening] = useState(false)

  const finalRef = useRef('')
  const baseRef = useRef('')

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Please use Chrome"); return }

    if (isListening) {
      ;(window as any)._keepListening = false
      ;(window as any)._recog?.stop()
      setIsListening(false)
      return
    }

    ;(window as any)._keepListening = true
    baseRef.current = draft? draft + ' ' : ''
    finalRef.current = ''

    const recog = new SR()
    ;(window as any)._recog = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'

    recog.onstart = () => setIsListening(true)
    recog.onend = () => {
      if ((window as any)._keepListening) {
        try { recog.start() } catch {}
      } else {
        setIsListening(false)
      }
    }

    recog.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalRef.current += txt + ' '
        } else {
          interim += txt + ' '
        }
      }
      // Show everything live — this is what fixes the "nothing displayed" bug
      let display = baseRef.current + finalRef.current + interim
      // Simple auto period + question
      if (finalRef.current) {
        display = display.replace(/\s+/g, ' ')
      }
      setDraft(display)
    }

    try { recog.start() } catch {}
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    // Add final punctuation on post
    let finalText = draft.trim()
    if (!/[.!?]$/.test(finalText)) {
      finalText += /^(how|what|when|where|who|why|do you|have you|can you)/i.test(finalText.split('.').pop()?.trim()||'')? '?' : '.'
    }
    await supabase.from('posts').insert({ user_id: user.id, body: finalText, tag })
    setDraft(''); finalRef.current=''; baseRef.current='';
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <div className="relative">
            <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Tap mic, then talk — your words will appear as you speak..." rows={6} className="w-full rounded-xl border-2 border-gray-300 p-4 pr-14 text-black text-lg outline-none" />
            <button onClick={toggleMic} className={`absolute right-2 top-2 w-12 h-12 rounded-full text-xl font-black shadow ${isListening?'bg-red-600 animate-pulse text-white':'bg-black text-white'}`}>{isListening?'■':'🎤'}</button>
          </div>
          <p className={`mt-2 text-sm font-bold ${isListening?'text-red-600':'text-gray-600'}`}>{isListening?'🔴 LIVE — Keep talking, I\'m typing as you talk. Tap ■ to stop':'🎤 Tap mic once. Talk. You will see words instantly.'}</p>
          <select value={tag} onChange={e=>setTag(e.target.value as Tag)} className="mt-3 rounded-full border-2 px-3 py-1.5 font-bold">{TAGS.map(t=><option key={t} value={t}>{t}</option>)}</select>
          <button onClick={submit} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
        </div>
      </main>
    </div>
  )
}
