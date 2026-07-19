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
  let t = text.trim().replace(/\s+/g,' ')
  if(!t) return t

  // Don't punctuate while user is still talking (interim) - only if text is longer than 3 words
  const questionStarters = /^(who|what|where|when|why|how|is|are|can|could|would|should|do|does|did|will|have|has|are we|is this|well let)/i

  // Split by natural pauses: "but", "and then", long runs
  // We keep it simple: capitalize first letter, add? or. at END only
  t = t.charAt(0).toUpperCase() + t.slice(1)

  // Auto sentences: if we see " but " or " and " after 10 words, put period
  t = t.replace(/\s+but then again\s+/gi, '. But then again ')
  t = t.replace(/\s+but\s+(?=[a-z])/gi, '. But ')
  t = t.replace(/\s+and then\s+/gi, '. And then ')

  // Ending punctuation
  if(!/[?.!]$/.test(t.trim())){
    if(questionStarters.test(t.trim())) t = t.trim() + '?'
    else t = t.trim() + '.'
  }

  // Fix double punctuation
  t = t.replace(/\s+([?.!])/g,'$1').replace(/([?.!])\1+/g,'$1')
  return t
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
  const finalRef = useRef('')

  const currentCat = CATEGORIES.find(c=>c.id===category)

  const toggleMic = async () => {
    if(listening){
      recRef.current?.stop?.()
      mediaRef.current?.stop?.()
      setListening(false)
      return
    }
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if(SR){
      try{
        const rec = new SR()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        recRef.current = rec
        finalRef.current = body? body + ' ' : ''
        rec.onstart = () => setListening(true)
        rec.onend = () => {
          setListening(false)
          if(finalRef.current){
            setBody(makeLegible(finalRef.current))
          }
        }
        rec.onresult = (e:any)=>{
          let interim = ''
          for(let i=e.resultIndex; i<e.results.length; i++){
            const txt = e.results[i][0].transcript
            if(e.results[i].isFinal){
              const clean = txt.trim()
              if(clean &&!finalRef.current.toLowerCase().includes(clean.toLowerCase().slice(0, Math.min(10, clean.length)))){
                finalRef.current = (finalRef.current + ' ' + clean).trim() + ' '
              }
            } else {
              interim = txt
            }
          }
          // While listening, show raw + legible at end
          const rawCombined = (finalRef.current + ' ' + interim).trim()
          setBody(rawCombined)
        }
        rec.onerror = () => { try{ rec.stop() }catch{}; startRecordingFallback() }
        rec.start()
        return
      }catch{}
    }
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
        stream.getTracks().forEach(t=>t.stop())
        const fd = new FormData()
        fd.append('audio', blob)
        const res = await fetch('/api/transcribe-elevenlabs', { method: 'POST', body: fd })
        const data = await res.json()
        if(data.text) setBody(prev=> makeLegible((prev? prev+' ':'') + data.text))
      }
      mr.start()
      setListening(true)
      finalRef.current = body? body + ' ' : ''
    }catch{
      alert('Mic blocked - check browser permissions')
    }
  }

  const handlePost = async () => {
    const finalBody = makeLegible(body)
    if(!finalBody.trim()) return
    setPosting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload: any = { body: finalBody.trim(), tag: category, category, zip_code: '95122', user_id: user?.id, location_address: address || null }
    if(price) payload.price = parseFloat(price)
    if(category==='for_sale') payload.condition = condition
    const { error } = await supabase.from('posts').insert(payload)
    setPosting(false)
    if(!error){ setBody(''); setPrice(''); setAddress(''); setCategory('general'); finalRef.current=''; onPosted?.() }
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
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Tap mic - works on any phone or computer. Try: are we good or are we not" className="w-full max-w-full min-w-0 bg-white rounded-xl p-3 text-black placeholder:text-black/40 min-h- flex-1 resize-none outline-none border" />
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
