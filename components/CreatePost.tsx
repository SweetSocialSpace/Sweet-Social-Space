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

export default function CreatePost({ onPosted }: { onPosted?: () => void }){
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('good')
  const [address, setAddress] = useState('')
  const [posting, setPosting] = useState(false)
  const [listening, setListening] = useState(false)
  const [activeField, setActiveField] = useState<'body'|'address'>('body')

  const currentCat = CATEGORIES.find(c=>c.id===category)

  const toggleMic = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) { alert('Mic not supported'); return }
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      if(activeField==='address'){
        setAddress(prev => prev? prev + ' ' + text : text)
      } else {
        setBody(prev => prev? prev + ' ' + text : text)
      }
    }
    rec.start()
  }

  const handlePost = async () => {
    if(!body.trim()) return
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
    if(price) payload.price = parseFloat(price)
    if(category==='for_sale') payload.condition = condition
    const { error } = await supabase.from('posts').insert(payload)
    setPosting(false)
    if(!error){
      setBody(''); setPrice(''); setAddress(''); setCategory('general')
      onPosted?.()
    } else alert('Error: ' + error.message)
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white mb-4">
      <p className="font-bold mb-3">📝 Post to 95122 - One Stop</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={()=>setCategory(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${category===c.id? 'bg-white text-black border-white' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`}>{c.icon} {c.label}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea
          value={body}
          onChange={e=>setBody(e.target.value)}
          onFocus={()=>setActiveField('body')}
          placeholder="Tap mic and talk... What's happening in 95122?"
        // CLEAN - NO BROKEN min-h- OR min-w-
className="w-full bg-white rounded-xl p-3 text-sm text-black min-h- flex-1"
className="flex-1 min-w- bg-white rounded-xl p-2.5 text-sm text-black"
className="text- text-white/60 mt-2"
className="text- text-white/40"
        <button onClick={toggleMic} className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-white shrink-0 ${listening? 'bg-red-600 animate-pulse text-white' : 'bg-black text-white'}`}>🎤</button>
      </div>
      {currentCat?.needsAddress && (
        <div className="mt-3 bg-white/10 rounded-xl p-3 border border-white/10">
          <div className="flex gap-2 flex-wrap">
            {category!=='event' && category!=='job' && (
              <input type="number" value={price} onChange={e=>setPrice(e.target.value)} onFocus={()=>setActiveField('body')} placeholder={category==='free'?'0': 'Price $'} className="w-24 bg-white rounded-xl p-2.5 text-sm text-black font-bold" />
            )}
            {category==='for_sale' && (
              <select value={condition} onChange={e=>setCondition(e.target.value)} className="bg-white rounded-xl p-2.5 text-sm text-black font-bold border border-black/10">
                <option value="new">New</option><option value="like_new">Like New</option><option value="good">Good</option><option value="fair">Fair</option>
              </select>
            )}
            <input
              value={address}
              onChange={e=>setAddress(e.target.value)}
              onFocus={()=>setActiveField('address')}
              placeholder={activeField==='address'? "🔴 Listening for address..." : "📍 Tap here then mic for address - PRIVATE"}
              className={`flex-1 min-w- bg-white rounded-xl p-2.5 text-sm text-black placeholder:text-black/40 font-bold border-2 ${activeField==='address'? 'border-blue-500 ring-2 ring-blue-300' : 'border-black/10'}`}
            />
          </div>
          <p className="text- text-white/60 mt-2">
            {activeField==='address'? '🔴 Mic now types ADDRESS - tap body box to type post again' : '💡 Tap address box first, then 🎤 to speak address. 🔒 Private until Map clicked'}
          </p>
        </div>
      )}
      <div className="flex justify-between items-center mt-3">
        <p className="text- text-white/40">Posting as • 95122 • {currentCat?.icon} {category} {listening && `• 🔴 Listening to ${activeField}...`}</p>
        <button onClick={handlePost} disabled={posting ||!body.trim()} className="bg-white text-black font-bold px-5 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-white/90">{posting? 'Posting...' : 'Post to 95122 🚀'}</button>
      </div>
    </div>
  )
}
