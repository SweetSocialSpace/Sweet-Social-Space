'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'

type Tag = "General" | "Alert" | "Recommendation" | "Free stuff" | "Hot take" | "Lost & found"
const TAGS: Tag[] = ["General", "Alert", "Recommendation", "Free stuff", "Hot take", "Lost & found"]

function smartPunctuate(text: string) {
  if (!text) return ''
  let t = text.toLowerCase().replace(/\s+/g,' ').trim()
  t = t.replace(/\s+(how many|do you like to|are you eating|do you like|how many questions|i'm going to|i have no idea)\s+/gi, ' | $1 ')
  let parts = t.split('|').map(s=>s.trim()).filter(Boolean)
  return parts.map(p=>{
    p = p.trim()
    if (!p) return ''
    p = p.charAt(0).toUpperCase() + p.slice(1)
    if (/[.!?]$/.test(p)) return p
    const isQ = /^(how many|do you|are you|can i|will it|is it|what|when|where|who|why)/i.test(p)
    return p + (isQ? '?':'.')
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
  const [imageFile, setImageFile] = useState<File|null>(null)
  const [imagePreview, setImagePreview] = useState<string|null>(null)

  const savedRef = useRef('')
  const finalRef = useRef('')

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])

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

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    // For now just post text + tag, image upload can be added to storage later
    await supabase.from('posts').insert({ user_id: user.id, body: draft.trim(), tag })
    setDraft(''); savedRef.current=''; finalRef.current=''; setImageFile(null); setImagePreview(null)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl p-4 shadow-xl">

          <div className="relative">
            <textarea value={draft} onChange={e=>{setDraft(e.target.value); savedRef.current=e.target.value}} placeholder="Tap mic and talk — I keep everything and add. and? automatically..." rows={5} className="w-full rounded-xl border-2 border-gray-300 p-4 pr-14 text-black text- outline-none" />
            <button onClick={toggleMic} className={`absolute right-2 top-2 w-12 h-12 rounded-full text-xl font-black shadow ${isListening?'bg-red-600 animate-pulse text-white':'bg-black text-white'}`}>{isListening?'■':'🎤'}</button>
          </div>

          <p className={`mt-2 text-sm font-bold ${isListening?'text-red-600':'text-gray-600'}`}>{isListening?'🔴 Listening — tap ■ to stop, it auto-adds punctuation':'🎤 Mic fixed — keeps your words, auto punctuation'}</p>

          {/* IMAGE UPLOAD — back */}
          <div className="mt-3 flex items-center gap-2">
            <label className="bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-black font-black rounded-full px-4 py-2 text-sm cursor-pointer">
              📷 Add Picture
              <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
            </label>
            {imagePreview && <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border" />}
            {imagePreview && <button onClick={()=>{setImageFile(null); setImagePreview(null)}} className="text-xs text-red-600 font-bold">Remove</button>}
          </div>

          {/* TAGS — NO MORE WHITE DROPDOWN — now big tappable pills */}
          <div className="mt-4">
            <p className="text-xs font-black text-gray-800 mb-2">POST AS:</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button
                  key={t}
                  onClick={()=>setTag(t)}
                  className={`px-4 py-2 rounded-full text-sm font-black border-2 transition ${tag===t? 'bg-black text-white border-black shadow' : 'bg-white text-black border-gray-400 hover:border-black'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={submit} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-full shadow">POST AS {tag.toUpperCase()}</button>
        </div>
      </main>
    </div>
  )
}
