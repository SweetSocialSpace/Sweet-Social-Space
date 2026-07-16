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
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [isListening, setIsListening] = useState(false)

  const savedRef = useRef('')
  const sessionRef = useRef('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
      } else {
        setUser(data.user)
      }
      setLoading(false)
    })
  }, [router, supabase])

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Please use Chrome')
      return
    }

    if (isListening) {
      ;(window as any)._keepListening = false
      ;(window as any)._recog?.stop()
      setIsListening(false)
      savedRef.current = draft
      sessionRef.current = ''
      return
    }

    ;(window as any)._keepListening = true
    savedRef.current = draft
    sessionRef.current = ''

    const recog = new SR()
    ;(window as any)._recog = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'

    recog.onstart = () => setIsListening(true)
    recog.onend = () => {
      if ((window as any)._keepListening) {
        try {
          recog.start()
        } catch {}
      } else {
        setIsListening(false)
      }
    }

    recog.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          sessionRef.current += txt + ' '
        } else {
          interim += txt + ' '
        }
      }
      const full = (savedRef.current? savedRef.current + ' ' : '') + sessionRef.current + interim
      setDraft(full.replace(/\s+/g, ' '))
    }

    try {
      recog.start()
    } catch {}
  }

  const fixPunctuation = () => {
    let t = draft.trim()
    if (!t) return
    t = t.replace(/\s+/g, ' ')
    t = t.replace(/\s+(how many|do you|do you like|can we|what about)\s+/gi, '. $1 ')
    const sentences = t.split('. ').map((s) => {
      s = s.trim()
      if (!s) return ''
      s = s.charAt(0).toUpperCase() + s.slice(1)
      if (!/[.!?]$/.test(s)) {
        const isQ = /^(how|what|when|where|who|why|do you|can we|does)/i.test(s)
        s = s + (isQ? '?' : '.')
      }
      return s
    }).filter(Boolean)
    const fixed = sentences.join(' ')
    setDraft(fixed + ' ')
    savedRef.current = fixed + ' '
    sessionRef.current = ''
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    await supabase.from('posts').insert({ user_id: user.id, body: draft.trim(), tag })
    setDraft('')
    savedRef.current = ''
    sessionRef.current = ''
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>
  }

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <div className="relative">
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                savedRef.current = e.target.value
              }}
              placeholder="Tap mic, talk, pause, tap again — it keeps everything..."
              rows={6}
              className="w-full rounded-xl border-2 border-gray-300 p-4 pr-14 text-black text- outline-none"
            />
            <button
              onClick={toggleMic}
              className={`absolute right-2 top-2 w-12 h-12 rounded-full text-xl font-black shadow ${isListening? 'bg-red-600 animate-pulse text-white' : 'bg-black text-white'}`}
            >
              {isListening? '■' : '🎤'}
            </button>
          </div>

          <p className={`mt-2 text-sm font-bold ${isListening? 'text-red-600' : 'text-gray-600'}`}>
            {isListening? '🔴 Talking — pause anytime, tap ■ to keep everything' : '🎤 Tap mic to talk, tap ■ to pause — tap mic again to continue, nothing deleted'}
          </p>

          <div className="flex gap-2 mt-2">
            <button onClick={fixPunctuation} className="text-xs bg-black text-white rounded-full px-4 py-1.5 font-bold">
              ✨ Add. and?
            </button>
            <span className="text-xs text-gray-500 self-center">Adds punctuation without deleting</span>
          </div>

          <select value={tag} onChange={(e) => setTag(e.target.value as Tag)} className="mt-3 rounded-full border-2 px-3 py-1.5 font-bold">
            {TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button onClick={submit} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">
            POST AS {tag.toUpperCase()}
          </button>
        </div>
      </main>
    </div>
  )
}
