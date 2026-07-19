'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '😊' },
  { id: 'safety', label: 'Safety', icon: '🚨' },
  { id: 'for_sale', label: 'For Sale', icon: '💰' },
  { id: 'free', label: 'Free', icon: '🎁' },
  { id: 'lost_pet', label: 'Lost Pet', icon: '🐶' },
  { id: 'event', label: 'Event', icon: '🎉' },
  { id: 'help', label: 'Help', icon: '🤝' },
  { id: 'recommend', label: 'Recommend', icon: '🌮' },
  { id: 'job', label: 'Job', icon: '💼' },
]

export default function CreatePost({ onPosted }: { onPosted?: () => void }){
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('good')
  const [posting, setPosting] = useState(false)

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
      user_id: user?.id
    }
    if(['for_sale','free','job'].includes(category)){
      if(price) payload.price = parseFloat(price)
      if(category === 'for_sale') payload.condition = condition
    }

    const { error } = await supabase.from('posts').insert(payload)
    setPosting(false)
    if(!error){
      setBody('')
      setPrice('')
      setCategory('general')
      onPosted?.()
    } else {
      alert('Error: ' + error.message)
    }
  }

  const isSale = ['for_sale','free','job','housing'].includes(category)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white mb-4">
      <p className="font-bold mb-3">📝 Post to 95122 - One Stop</p>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={()=>setCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              category===c.id
               ? 'bg-white text-black border-white'
                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={e=>setBody(e.target.value)}
        placeholder={
          category==='for_sale'? 'What are you selling? e.g. Kids bike $20 - barely used...' :
          category==='free'? 'What are you giving away free to a neighbor?' :
          category==='lost_pet'? 'Lost pet? Describe, last seen, photo, reward...' :
          category==='safety'? 'Safety alert for 95122...' :
          category==='help'? 'What do you need help with?' :
          category==='recommend'? 'Recommend a business or place in 95122...' :
          'What\'s happening in 95122?'
        }
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 min-h-"
      />

      {isSale && (
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            value={price}
            onChange={e=>setPrice(e.target.value)}
            placeholder={category==='free'? 'Free (0)' : 'Price $'}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm"
          />
          {category==='for_sale' && (
            <select value={condition} onChange={e=>setCondition(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm">
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <p className="text- text-white/40">Posting as • 95122 • {CATEGORIES.find(c=>c.id===category)?.icon} {category}</p>
        <button
          onClick={handlePost}
          disabled={posting ||!body.trim()}
          className="bg-white text-black font-bold px-5 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-white/90"
        >
          {posting? 'Posting...' : `Post to 95122 🚀`}
        </button>
      </div>
    </div>
  )
}
