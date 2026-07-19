'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Category = {
  id: string
  label: string
  icon: string
  needsAddress: boolean
}

const CATEGORIES: readonly Category[] = [
  { id: 'general', label: 'General', icon: '😊', needsAddress: false },
  { id: 'safety', label: 'Safety', icon: '🚨', needsAddress: true },
  { id: 'for_sale', label: 'For Sale', icon: '💰', needsAddress: true },
  { id: 'free', label: 'Free', icon: '🎁', needsAddress: true },
  { id: 'lost_pet', label: 'Lost Pet', icon: '🐶', needsAddress: true },
  { id: 'event', label: 'Event', icon: '🎉', needsAddress: true },
  { id: 'help', label: 'Help', icon: '🤝', needsAddress: false },
  { id: 'recommend', label: 'Recommend', icon: '🌮', needsAddress: false },
  { id: 'job', label: 'Job', icon: '💼', needsAddress: true },
] as const

export default function CreatePost({ onPosted }: { onPosted?: () => void }) {
  const [body, setBody] = useState('')
  const [interim, setInterim] = useState('')
  const [category, setCategory] = useState('general')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('good')
  const [address, setAddress] = useState('')
  const [posting, setPosting] = useState(false)
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const shouldBeListeningRef = useRef(false)
  const finalTranscriptRef = useRef('')

  const currentCat = CATEGORIES.find(c => c.id === category)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
    return () => {
      shouldBeListeningRef.current = false
      try { recognitionRef.current?.stop() } catch {}
    }
  }, [])

  const formatFinal = useCallback((text: string) => {
    let cleaned = text
     .replace(/\bperiod\b/gi, '.')
     .replace(/\bcomma\b/gi, ',')
     .replace(/\bquestion mark\b/gi, '?')
     .replace(/\bexclamation point\b/gi, '!')
     .replace(/\s+/g, ' ')
     .trim()
    cleaned = cleaned.replace(/(^\w|[.!?]\s+\w)/g, c => c.toUpperCase())
    return cleaned
  }, [])

  const startRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setSupported(false)
      return
    }

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    recognitionRef.current = rec

    rec.onstart = () => setListening(true)

    rec.onresult = (event: any) => {
      let interimText = ''
      let finalChunk = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) finalChunk += res[0].transcript + ' '
        else interimText += res[0].transcript + ' '
      }

      if (finalChunk) {
        const formatted = formatFinal(finalChunk)
        const next = finalTranscriptRef.current
         ? `${finalTranscriptRef.current} ${formatted}`
          : formatted
        finalTranscriptRef.current = next
        setBody(next)
        setInterim('')
      } else {
        setInterim(interimText.trim())
      }
    }

    rec.onerror = (e: any) => {
      console.error('Speech error', e.error)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        shouldBeListeningRef.current = false
        setListening(false)
        alert('Mic permission denied. Enable it in browser settings.')
      }
      if (e.error === 'no-speech') return
    }

    rec.onend = () => {
      setListening(false)
      setInterim('')
      if (shouldBeListeningRef.current) {
        setTimeout(() => {
          if (shouldBeListeningRef.current) startRecognition()
        }, 300)
      }
    }

    try { rec.start() } catch {}
  }, [formatFinal])

  const toggleMic = () => {
    if (!supported) {
      alert('Voice input not supported. Use Chrome on desktop or Android.')
      return
    }
    if (listening) {
      shouldBeListeningRef.current = false
      recognitionRef.current?.stop()
      return
    }
    shouldBeListeningRef.current = true
    finalTranscriptRef.current = body
    startRecognition()
  }

  const handlePost = async () => {
    const trimmed = body.trim()
    if (!trimmed) return
    if (currentCat?.needsAddress &&!address.trim() && category!== 'free') {
      // optional: make address required
    }

    setPosting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const payload: any = {
      body: trimmed,
      tag: category,
      category,
      zip_code: '95122',
      user_id: user?.id,
      location_address: address.trim() || null
    }

    if (price &&!['event', 'job'].includes(category)) {
      const p = parseFloat(price)
      if (!isNaN(p) && p >= 0) payload.price = p
    }
    if (category === 'for_sale') payload.condition = condition

    const { error } = await supabase.from('posts').insert(payload)
    setPosting(false)

    if (!error) {
      setBody('')
      setInterim('')
      finalTranscriptRef.current = ''
      setPrice('')
      setAddress('')
      setCategory('general')
      onPosted?.()
    } else {
      alert(error.message)
    }
  }

  // show interim as ghost text, don't make it part of the editable value
  const canPost = body.trim().length > 2

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white mb-4">
      <p className="font-bold mb-3">📝 Post to 95122 - One Stop</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${category === c.id? 'bg-white text-black border-white' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <textarea
            value={body}
            onChange={e => {
              setBody(e.target.value)
              finalTranscriptRef.current = e.target.value
            }}
            placeholder={listening? "Listening..." : "Tap mic and talk..."}
            className="w-full bg-white rounded-xl p-3 text-black placeholder:text-black/40 min-h- resize-none outline-none border focus:ring-2 focus:ring-white/20"
          />
          {interim && (
            <div className="pointer-events-none absolute inset-0 p-3 text-black/40">
              <span className="invisible">{body} </span>
              <span className="italic">{interim}</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleMic}
          type="button"
          disabled={!supported}
          className={`h-12 w-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${listening? 'bg-red-600 animate-pulse border-red-400' : 'bg-black hover:bg-white/10 border-white'} disabled:opacity-30`}
        >
          🎤
        </button>
      </div>

      {currentCat?.needsAddress && (
        <div className="mt-3 bg-white/10 rounded-xl p-3 border border-white/10">
          <div className="flex gap-2 flex-wrap">
            {!['event', 'job'].includes(category) && (
              <input
                value={price}
                onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                type="text"
                inputMode="decimal"
                placeholder={category === 'free'? 'Free (0)' : 'Price $'}
                className="bg-white rounded-xl p-2.5 text-sm text-black w-24 outline-none"
              />
            )}
            {category === 'for_sale' && (
              <select value={condition} onChange={e => setCondition(e.target.value)} className="bg-white rounded-xl p-2.5 text-sm text-black outline-none">
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            )}
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="📍 Address - Private (e.g. 1845 King Rd)"
              className="flex-1 min-w- bg-white rounded-xl p-2.5 text-sm text-black placeholder:text-black/40 outline-none"
            />
          </div>
          <p className="text-xs text-white/50 mt-2">🔒 Address PRIVATE - Only shown when neighbor clicks Map & Directions</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-white/40">Posting as • 95122 • {currentCat?.icon} {category}</p>
        <button
          onClick={handlePost}
          disabled={posting ||!canPost}
          className="bg-white text-black font-bold px-5 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-white/90 transition"
        >
          {posting? 'Posting...' : 'Post to 95122 🚀'}
        </button>
      </div>
    </div>
  )
}
