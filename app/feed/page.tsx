'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

function smartPunctuate(text: string) {
  if (!text) return ''
  let t = text.replace(/\s+/g,' ').trim()
  if (!t) return ''

  const breaks = [
    "so can we see","what time","how many","does anybody","does anyone",
    "can anybody","can anyone","are you able","what's going on","what is going",
    "now we're","now we are","so i can","so we can","in other words",
    "so then","after that","before that","love is","what time","how are",
    "where are","hopefully","actually","anyway","meanwhile","finally",
    "now","then","so"
  ].sort((a,b)=>b.length - a.length) // longest first - this was the bug

  for (const b of breaks) {
    // don't put a period at the very start
    const re = new RegExp(`(?<!^)\\s+${b}\\s+`, 'gi')
    t = t.replace(re, `. ${b} `)
  }

  let parts = t.split('.').map(s=>s.trim()).filter(Boolean)
  
  // Safety net: if still a monster sentence over 20 words, force break every 15
  let finalParts: string[] = []
  for (const part of parts) {
    const w = part.split(' ')
    if (w.length > 20) {
      for (let i=0; i<w.length; i+=15) {
        finalParts.push(w.slice(i, i+15).join(' '))
      }
    } else {
      finalParts.push(part)
    }
  }

  return finalParts.map(p=>{
    if (!p) return ''
    p = p.charAt(0).toUpperCase() + p.slice(1)
    if (/[.!?]$/.test(p)) return p
    const isQ = /^(how many|what time|how are|where|when|why|who|does anybody|does anyone|do you|are you|can anybody|can you|will it|is it|what's|are you able|so can we)/i.test(p)
    return p + (isQ? '?' : '.')
  }).join(' ').trim()
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [tag, setTag] = useState<Tag>('General')
  const [isListening, setIsListening] = useState(false)
  const [preview, setPreview] = useState<string|null>(null)
  const [posts, setPosts] = useState<any[]>([])

  const savedRef = useRef('')
  const finalRef = useRef('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setUser(data.user)
      setLoading(false)
    })
    loadPosts()
  }, [])

  const loadPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50)
    if (!error && data) setPosts(data)
  }

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome"); return }
    if (isListening) {
      ;(window as any)._keepListening = false
      ;(window as any)._recog?.stop()
      setIsListening(false)
      setDraft(prev => {
        const formatted = smartPunctuate(prev)
        savedRef.current = formatted
        return formatted + ' '
      })
      finalRef.current = ''
      return
    }
    savedRef.current = draft
    finalRef.current = ''
    ;(window as any)._keepListening = true
    const recog = new SR()
    ;(window as any)._recog = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'
    recog.onstart = () => setIsListening(true)
    recog.onend = () => { if ((window as any)._keepListening) { try{recog.start()}catch{} } }
    recog.onresult = (e:any) => {
      let interim = ''
      for (let i=e.resultIndex; i<e.results.length; i++) {
        const txt = e.results[i][0].transcript
        if (e.results[i].isFinal) finalRef.current += txt + ' '
        else interim += txt + ' '
      }
      setDraft(savedRef.current + (savedRef.current?' ':'') + finalRef.current + interim)
    }
    recog.start()
  }

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const submit = async () => {
    const textToPost = draft.trim()
    if (!textToPost ||!user) return

    try {
      ;(window as any)._keepListening = false
      ;(window as any)._recog?.stop()
    } catch {}
    setIsListening(false)

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      body: textToPost,
      tag: tag
    })

    if (error) {
      alert("Post failed: " + error.message)
      return
    }

    setDraft('')
    savedRef.current = ''
    finalRef.current = ''
    setPreview(null)
    loadPosts()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-xl">
          <div className="relative">
            <textarea
              value={draft}
              onChange={e=>{setDraft(e.target.value); savedRef.current=e.target.value}}
              placeholder="Tap mic and talk — I keep everything..."
              rows={5}
              className="w-full rounded-xl border-2 border-gray-300 p-4 pr-14 text-black text- outline-none"
            />
            <button type="button" onClick={toggleMic} className={`absolute right-2 top-2 w-12 h-12 rounded-full text-xl font-black shadow border-2 ${isListening?'bg-red-600 border-red-700 animate-pulse text-white':'bg-black border-black text-white'}`}>{isListening?'■':'🎤'}</button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className={`text-sm font-bold ${isListening?'text-red-600':'text-gray-700'}`}>{isListening?'🔴 Listening — tap ■ to stop':'🎤 Mic keeps your words'}</p>
            <button type="button" onClick={()=>setDraft(d=>smartPunctuate(d)+' ')} className="ml-auto text-xs bg-black text-white rounded-full px-3 py-1 font-black">✨ Fix. and?</button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="bg-black text-white border-2 border-black font-black rounded-full px-5 py-2.5 text-sm cursor-pointer shadow">
              📷 Add Picture / Video
              <input type="file" accept="image/*,video/*" onChange={onPickFile} className="hidden" />
            </label>
            {preview && <div className="flex items-center gap-2"><img src={preview} alt="preview" className="w-16 h-16 rounded-xl object-cover border-2 border-black" /><button type="button" onClick={()=>setPreview(null)} className="text-sm font-black text-red-600">Remove</button></div>}
          </div>
          <div className="mt-4">
            <p className="text-xs font-black text-black mb-2">POST AS:</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button type="button" key={t} onClick={()=>setTag(t)} className={`px-4 py-2 rounded-full text-sm font-black border-2 ${tag===t? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-gray-100'}`}>{t}</button>
              ))}
            </div>
          </div>
          <button type="button" onClick={submit} className="mt-5 w-full bg-blue-600 text-white font-black py-3.5 rounded-full">POST AS {tag.toUpperCase()}</button>
        </div>

        <div className="space-y-3">
          {posts.length===0 && <div className="bg-black/30 backdrop-blur rounded-2xl border border-white/10 p-6 text-center text-white font-bold">No posts yet. Be the first to share.</div>}
          {posts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full">{p.tag || 'General'}</span>
                <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span>
              </div>
              <p className="text-black text- whitespace-pre-wrap">{p.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
