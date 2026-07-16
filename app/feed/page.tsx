'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

// Common fixes like Windows does
const AUTO_CORRECT: Record<string,string> = {
  'teh':'the','adn':'and','becuase':'because','becasue':'because','apples':'apples',
  'dont':'don\'t','im':'I\'m','i\'m':'I\'m','u':'you','ur':'your','thier':'their',
  'recieve':'receive','wondering':'wondering','realy':'really','alot':'a lot',
  'gonna':'going to','wanna':'want to','gotta':'got to'
}

const COMMON_NEXT: Record<string,string[]> = {
  'how':['are you','do you','is it','can you'],
  'do':['you','you like','you eat','you have'],
  'what':['is','is your','do you','are you'],
  'i':['hope','was wondering','have','think'],
  'hello':['everyone','there','guys'],
  'thank':['you','you guys','you so much']
}

function smartFormat(text: string) {
  let t = text.replace(/\s+/g,' ').trim()
  if (!t) return ''
  // autocorrect words
  t = t.split(' ').map(w => AUTO_CORRECT[w.toLowerCase()] || w).join(' ')
  // split thoughts into sentences
  t = t.replace(/\s+(i have|sometimes|do that|i was wondering|create a|help me|and help|or do you)\s+/gi, '. $1 ')
  let sentences = t.split(/(?<=[.!?])\s+/).map(s => {
    s = s.trim()
    if (!s) return ''
    s = s.charAt(0).toUpperCase() + s.slice(1)
    if (!/[.!?]$/.test(s)) {
      const isQ = /^(how|what|when|where|who|why|do you|have you|can you|are you|is there|what's)/i.test(s)
      s += isQ? '?' : '.'
    }
    return s
  })
  return sentences.join(' ').trim()
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [stats, setStats] = useState({ saved: 0 })

  const rawSpeechRef = useRef('')
  const baseTextRef = useRef('')

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])
  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setPosts(data)
  }

  // Update suggestions like Windows
  useEffect(() => {
    const words = draft.trim().split(/\s+/)
    const last = words[words.length-1]?.toLowerCase() || ''
    if (last && COMMON_NEXT[last]) setSuggestions(COMMON_NEXT[last])
    else if (last.length>1) {
      // simple autocomplete for current word
      const opts = Object.keys(AUTO_CORRECT).filter(k => k.startsWith(last)).slice(0,3)
      setSuggestions(opts.map(o => AUTO_CORRECT[o]))
    } else setSuggestions([])
  }, [draft])

  const applySuggestion = (word: string) => {
    setDraft(prev => {
      let words = prev.trim().split(/\s+/)
      words[words.length-1] = word
      return words.join(' ') + ' '
    })
    setStats(s => ({ saved: s.saved + 3 }))
  }

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    ;(window as any)._recognition = rec
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onstart = () => setIsListening(true)
    rec.onend = () => { if ((window as any)._shouldListen) { try { rec.start() } catch {} } else setIsListening(false) }
    rec.onresult = (e:any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          rawSpeechRef.current += ' ' + e.results[i][0].transcript
          setDraft(baseTextRef.current + smartFormat(rawSpeechRef.current) + ' ')
        }
      }
    }
    rec.start()
  }

  const toggleMic = () => {
    if (isListening) {
      ;(window as any)._shouldListen = false
      ;(window as any)._recognition?.stop()
      setIsListening(false)
    } else {
      ;(window as any)._shouldListen = true
      baseTextRef.current = draft? draft.trimEnd() + ' ' : ''
      rawSpeechRef.current = ''
      startListening()
    }
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    await supabase.from('posts').insert({ user_id: user.id, body: draft.trim(), tag })
    setDraft(''); rawSpeechRef.current=''; baseTextRef.current=''; load()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10 p-3 space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-xl">

            {/* Windows-style suggestion bar */}
            {suggestions.length>0 && (
              <div className="flex gap-2 mb-2">
                {suggestions.map(s => (
                  <button key={s} onClick={()=>applySuggestion(s)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold text-black border">{s}</button>
                ))}
                <span className="text- text-gray-400 self-center ml-auto">AI typing • {stats.saved} keystrokes saved</span>
              </div>
            )}

            <div className="relative">
              <textarea value={draft} onChange={e=>{ setDraft(e.target.value); rawSpeechRef.current=e.target.value }} placeholder="Tap mic and talk normal — I help you type like Windows does..." rows={5} className="w-full rounded-xl bg-white border-2 border-gray-200 focus:border-blue-500 p-4 pr-14 text-black placeholder:text-gray-500 outline-none" />
              <button onClick={toggleMic} className={`absolute right-2 top-2 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow ${isListening?'bg-red-600 animate-pulse':'bg-black'} text-white`}>{isListening?'■':'🎤'}</button>
            </div>

            <p className="mt-2 text- font-bold text-gray-500">
              {isListening? '🔴 Listening — I auto-add. and? and fix typos' : '🎤 Windows-style: suggestions, autocorrect, auto. and? — just talk or type'}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">POST AS:</span>
              <select value={tag} onChange={e=>setTag(e.target.value as Tag)} className="rounded-full border-2 border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-black">{TAGS.map(t=><option key={t} value={t}>{t}</option>)}</select>
            </div>
            <button onClick={submit} className="mt-3 w-full bg-blue-600 text-white font-black py-3 rounded-full">POST AS {tag.toUpperCase()}</button>
          </div>
        </div>
      </main>
    </div>
  )
}
