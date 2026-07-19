'use client'
import { useState, useRef } from 'react'
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
]

function makeLegible(text: string){
  if(!text) return text
  let t = text.trim()
  // Fix spacing
  t = t.replace(/\s+/g, ' ')
  // Auto sentence split on long pauses = "and then"
  // Detect questions
  const questionStarters = /^(who|what|where|when|why|how|is|are|can|could|would|should|do|does|did|will|have|has|are we|is this)/i
  // Split into sentences
  let sentences = t.split(/(?<=[.!?])\s+|(?=\bwho\b|\bwhat\b|\bwhere\b)/i)
  sentences = sentences.map(s=>{
    s = s.trim()
    if(!s) return s
    // Capitalize first letter
    s = s.charAt(0).toUpperCase() + s.slice(1)
    // If looks like question but no?, add?
    if(questionStarters.test(s) &&!/[?.!]$/.test(s)) s += '?'
    // If no ending punctuation, add.
    else if(!/[?.!]$/.test(s)) s += '.'
    // Emphasis: if user said "really really" -> keep one, or if LOUD we can't detect loud, but we can detect "very" -> keep
    return s
  })
  return sentences.join(' ').replace(/\s+([?.!])/g, '$1')
}

export default function CreatePost({ onPosted }: { onPosted?: () => void }){
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('good')
  const [address, setAddress] = useState('')
  const [posting, setPosting] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef = useRef<any>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)

  const currentCat = CATEGORIES.find(c=>c.id===category)

  const toggleMic = async () => {
    if(listening){
      recRef.current?.stop?.()
      mediaRef.current?.stop?.()
      setListening(false)
      return
    }

    // 1. Try native Web Speech - works on Chrome/Edge/Safari
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if(SR){
      try{
        const rec = new SR()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        recRef.current = rec
        rec.onstart = () => setListening(true)
        rec.onend = () => setListening(false)
        rec.onresult = (e:any)=>{
          let transcript = ''
          for(let i=e.resultIndex; i<e.results.length; i++){
            transcript += e.results[i][0].transcript + ' '
          }
          setBody(prev=> makeLegible((prev? prev+' ':'') + transcript))
        }
        rec.onerror = async () => {
          // If native fails, fall back to recording
          startRecordingFallback()
        }
        rec.start()
        return
      }catch{}
    }
    // 2. Universal fallback - works on Firefox, iPhone, any computer
    startRecordingFallback()
  }

  const startRecordingFallback = async () => {
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      const chunks: BlobPart[] = []
      mr.ondataavailable = e=> chunks.push(e.data)
      mr.onstop = async ()=>{
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setListening(false)
        // Send to your ElevenLabs / Whisper API - works everywhere
        const fd = new FormData()
        fd.append('audio', blob)
        const res = await fetch('/api/transcribe-elevenlabs', { method: 'POST', body: fd })
        const data = await res.json()
        if(data.text) setBody(prev=> makeLegible((prev? prev+' ':'') + data.text))
      }
      mr.start()
      setListening(true)
    }catch(err){
      alert('Mic blocked - check browser permissions')
    }
  }

  const handlePost = async () => {
    if(!body.trim()) return
    setPosting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload: any = { body: body.trim(), tag: category, category, zip_code: '95122', user_id: user?.id, location_address: address || null }
    if(price) payload.price = parseFloat(price)
    if(category==='for_sale') payload.condition = condition
    const { error } = await supabase.from('posts').insert(payload)
    setPosting(false)
    if(!error){ setBody(''); setPrice(''); setAddress(''); setCategory('general'); onPosted?.() }
    else alert(error.message)
  }

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white mb-4">
      <p className="font-bold mb-3">📝 Post to 95122 - One Stop</p>
      <div className="flex flex-wrap gap-2 mb-4 w-full max-w-full min-w-0">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={()=>setCategory(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${category===c.id? 'bg-white text-black border-white' : 'bg-white/10 border-white/20 text-white/70'}`}>{c.icon} {c.label}</button>
        ))}
      </div>
      <div className="flex gap-2 w-full max-w-full min-w-0">
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Tap mic - works on any phone or computer. Try: are we good or are we not" className="w-full max-w-full min-w-0 bg-white rounded-xl p-3 text- text-black placeholder:text-black/40 min-h- flex-1 resize-none outline-none border" />
        <button onClick={toggleMic} className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-white shrink-0 ${listening? 'bg-red-600 animate-pulse' : 'bg-black'}`}>🎤</button>
      </div>
      {currentCat?.needsAddress && (
        <div className="mt-3 bg-white/10 rounded-xl p-3 border border-white/10 w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex gap-2 w-full max-w-full min-w-0 flex-wrap">
            <input value={price} onChange={e=>setPrice(e.target.value)} placeholder={category==='free'?'Free (0)': category==='for_sale'?'Price $':' '} className={`bg-white rounded-xl p-2.5 text-sm text-black ${category==='event' || category==='job'? 'hidden' : 'w-24'}`} />
            {category==='for_sale' && <select value={condition} onChange={e=>setCondition(e.target.value)} className="bg-white rounded-xl p-2.5 text-sm text-black"><option value="new">New</option><option value="like_new">Like New</option><option value="good">Good</option><option value="fair">Fair</option></select>}
            <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="📍 Address - Private" className="flex-1 min-w-0 bg-white rounded-xl p-2.5 text-sm text-black" />
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mt-3 w-full max-w-full min-w-0">
        <p className="text-xs text-white/40">Posting as • 95122 • {currentCat?.icon} {category} • Universal Mic</p>
        <button onClick={handlePost} disabled={posting ||!body.trim()} className="bg-white text-black font-bold px-5 py-2 rounded-full text-sm disabled:opacity-40">Post to 95122 🚀</button>
      </div>
    </div>
  )
}
