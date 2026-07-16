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

  const savedTextRef = useRef('')
  const sessionFinalRef = useRef('')

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth'); else setUser(data.user); setLoading(false) }) }, [router, supabase])

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome"); return }

    if (isListening) {
      ;(window as any)._keepListening = false
      ;(window as any)._recog?.stop()
      setIsListening(false)
      savedTextRef.current = draft
      sessionFinalRef.current = ''
      return
    }

    savedTextRef.current = draft
    sessionFinalRef.current = ''
    ;(window as any)._keepListening = true

    const recog = new SR()
    ;(window as any)._recog = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'
    recog.onstart = () => setIsListening(true)
    recog.onend = () => { if ((window as any)._keepListening) { try{recog.start()}catch{} } else setIsListening(false) }
    recog.onresult = (event:any) => {
      let interim = ''
      for (let i=event.resultIndex; i<event.results.length; i++) {
        const txt = event.results[i][0].transcript
        if (event.results[i].isFinal) sessionFinalRef.current += txt + ' '
        else interim += txt + ' '
      }
      // NEVER DELETE — old + new
      setDraft((savedTextRef.current? savedTextRef.current + ' ' : '') + sessionFinalRef.current + interim)
    }
    recog.start()
  }

  const formatNow = () => {
    let t = draft.trim()
    if (!t) return
    t = t.replace(/\s+(how many|how do you|do you|can we|what about)\s+/gi, '. $1 ')
    t = t.split('. ').map(s=>{
      s=s.trim()
      if(!s) return ''
      s=s.charAt(0).toUpperCase()+s.slice(1)
      if(!/[.!?]$/.test(s)){
        const q = /^(how|what|when|where|who|why|do you|can we|does|are you)/i.test(s)
        s+= q? '?' : '.'
      }
      return s
    }).filter(Boolean).join(' ')
    setDraft(t + ' ')
    savedTextRef.current = t + ' '
    sessionFinalRef.current = ''
  }

  const submit = async () => {
    if (!draft.trim() ||!user) return
    await supabase.from('posts').insert({ user_id: user.id, body: draft.trim(), tag })
    setDraft(''); savedTextRef.current=''; sessionFinalRef.current=''
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        {/* This restores your glass card look */}
        <div className="bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10 p-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-xl">

            <div className="relative">
              <textarea
                value={draft}
                onChange={e=>{setDraft(e.target.value); savedTextRef.current=e.target.value}}
                placeholder="Tap mic, talk, pause, tap again to continue..."
                rows={6}
                className="w-full rounded-xl bg-white border-2 border-gray-300 focus:border-blue-500 p-4 pr-14 text-black placeholder:text-gray-500 text- font-medium outline-none"
              />
              <button onClick={toggleMic} className={`absolute right-2 top-2 w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shadow-lg border-2 ${isListening?'bg-red-600 border-red-700 animate-pulse text-white':'bg-black border-black text-white'}`}>{isListening?'■':'🎤'}</button>
            </div>

            <p className={`mt-2 text- font-bold ${isListening?'text-red-600':'text-gray-700'}`}>{isListening?'🔴 LIVE — I keep everything, even when you pause':'🎤 Tap mic to talk — tap ■ to pause — tap mic again to add more. Nothing deleted.'}</p>

            <div className="flex items-center gap-2 mt-3">
              <button onClick={formatNow} className="bg-black text-white rounded-full px-4 py-2 text-sm font-black border-2 border-black shadow">✨ Fix punctuation</button>
              <span className="text- font-bold text-gray-600">Adds. and? without deleting words</span>
            </div>

            {/* THIS WAS THE UNREADABLE ONE — NOW BLACK TEXT ON WHITE */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-black text-gray-800">POST AS:</span>
              <select value={tag} onChange={e=>setTag(e.target.value as Tag)} className="rounded-full border-2 border-gray-400 bg-white px-4 py-2 text-sm font-black text-black shadow-sm outline-none focus:border-blue-500">
                {TAGS.map(t=><option key={t} value={t} className="text-black bg-white">{t}</option>)}
              </select>
            </div>

            <button onClick={submit} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-full shadow-lg text- tracking-wide">POST AS {
