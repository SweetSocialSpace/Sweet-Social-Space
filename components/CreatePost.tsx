'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
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
  const [category, setCategory] = useState<string>('general')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('good')
  const [address, setAddress] = useState('')
  const [posting, setPosting] = useState(false)
  const [listening, setListening] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldBeListeningRef = useRef(false)
  const finalTranscriptRef = useRef('')

  const currentCat = CATEGORIES.find(c => c.id === category)

  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false
      recognitionRef.current?.stop()
    }
  }, [])

  const getSpeechRecognition = () => {
    if (typeof window === 'undefined') return null
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return null
    return SR
  }

  const formatTranscript = (text: string) => {
    let cleaned = text
     .replace(/\s+period/gi, '.')
     .replace(/\s+comma/gi, ',')
     .replace(/\s+question mark/gi, '?')
     .replace(/\s+exclamation point/gi, '!')
     .replace(/\s+/g, ' ')
     .trim()
    cleaned = cleaned.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase())
    return cleaned
  }

  const startRecognition = () => {
    const SR = getSpeechRecognition()
    if (!SR) {
      alert('Voice input not supported in this browser. Try Chrome.')
      return
    }

    const rec: SpeechRecognition = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    recognitionRef.current = rec
    finalTranscriptRef.current = body

    rec.onstart = () => setListening(true)

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) {
          finalText += transcript + ' '
        } else {
          interimText += transcript + ' '
        }
      }

      if (finalText) {
        const formatted = formatTranscript(finalText)
        finalTranscriptRef.current = finalTranscriptRef.current
         ? finalTranscriptRef.current + ' ' + formatted
          : formatted
        setBody(finalTranscriptRef.current)
        setInterim('')
      }

      if (interimText) {
        setInterim(formatTranscript(interimText))
      }
    }

    rec.onerror = (e: any) => {
      if (e.error === 'no-speech') return
      console.error('Speech error', e)
      setListening(false)
    }

    rec.onend = () => {
      setListening(false)
      setInterim('')
      if (shouldBeListeningRef.current) {
        // restart with new instance (required on Chrome)
        setTimeout(() => {
          if (shouldBeListeningRef.current) startRecognition()
        }, 250)
      }
    }

    try {
      rec.start()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleMic = () => {
    if (listening) {
      shouldBeListeningRef.current = false
      recognitionRef.current?.stop()
      setListening(false)
      setInterim('')
      return
    }
    shouldBeListeningRef.current = true
    finalTranscriptRef.current = body
    startRecognition()
  }

  const handlePost = async () => {
    if (!body.trim()) return
    setPosting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const payload: any = {
      body: body.trim(),
      tag: category,
      category,
      zip_code: '95122',
      user_id: user?.id,
      location_address: address || null
    }
    if (price && category!== 'event' && category!== 'job') {
      const p = parseFloat(price)
      if (!isNaN(p)) payload.price = p
    }
    if (category === 'for_sale') payload.condition = condition

    const { error } = await supabase.from('posts').insert(payload)
    setPosting(false)

    if (!error) {
      setBody('')
      finalTranscriptRef.current = ''
      setInterim('')
      setPrice('')
      setAddress('')
      setCategory('general')
      onPosted?.()
    } else {
      alert(error.message)
    }
  }

  const displayValue = interim? (body? `${body} ${interim}` : interim) : body

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white mb-4">
      <p className="font-bold mb-3">📝 Post to 95122 - One Stop</p>

      <div className="flex flex-wrap gap-2 mb-4 w-full max-w-full min-w-0">
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

      <div className="flex gap-2 w-full max-w-full min-w-0">
        <textarea
          value={displayValue}
          onChange={e => {
            setBody(e.target.value)
            finalTranscriptRef.current = e.target.value
            setInterim('')
          }}
          placeholder="Tap mic and talk..."
          className="w-full max-w-full min-w-0 bg-white rounded-xl p-3 text-black placeholder:text-black/40 min-h- flex-1 resize-none outline-none border focus:ring-2 focus:ring-white/20"
        />
        <button
          onClick={toggleMic}
          type="button"
          className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-white shrink-0 transition-all ${listening? 'bg-red-600 animate-pulse border-red-400' : 'bg-black hover:bg-white/10'}`}
          aria-label={listening? 'Stop listening' : 'Start listening'}
        >
          🎤
        </button>
      </div>

      {currentCat?.needsAddress && (
        <div className="mt-3 bg-white/10 rounded-xl p-3 border border-white/10 w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex gap-2 w-full max-w-full min-w-0 flex-wrap">
            {category!== 'event' && category!== 'job' && (
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                type="number"
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
              className="flex-1 min-w-0 bg-white rounded-xl p-2.5 text-sm text-black placeholder:text-black/40 outline-none"
            />
          </div>
          <p className="text-xs text-white/50 mt-2">🔒 Address PRIVATE - Only shown when neighbor clicks Map & Directions</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-3 w-full max-w-full min-w-0">
        <p className="text-xs text-white/40">Posting as • 95122 • {currentCat?.icon} {category}</p>
        <button
          onClick={handlePost}
          disabled={posting ||!body.trim()}
          className="bg-white text-black font-bold px-5 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-white/90 transition"
        >
          {posting? 'Posting...' : 'Post to 95122 🚀'}
        </button>
      </div>
    </div>
  )
}
