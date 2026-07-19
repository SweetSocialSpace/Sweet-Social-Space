'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CreatePost({ onPosted }: { onPosted?: () => void }) {
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('good')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const post = async () => {
    if (!body.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('zip_code').eq('id', user.id).single()
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      body: body.trim(),
      category,
      price: price? Number(price) : null,
      condition: condition || null,
      zip_code: profile?.zip_code || '95122',
    })
    setLoading(false)
    if (!error) {
      setBody(''); setPrice('')
      onPosted?.()
    }
  }

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden bg-white rounded-2xl p-4 border border-black/10">
      <textarea
        value={body}
        onChange={e=>setBody(e.target.value)}
        placeholder="What's happening in 95122?"
         className="w-full max-w-full min-w-0 bg-gray-100 text-black rounded-xl p-3 text-[14px] min-h-[80px] resize-none outline-none border border-black/10"
      />
      <div className="mt-3 flex gap-2 flex-wrap w-full max-w-full min-w-0">
        <select value={category} onChange={e=>setCategory(e.target.value)} className="bg-black text-white text-xs font-black px-3 py-2 rounded-full border">
          <option value="general">General</option>
          <option value="safety">Safety</option>
          <option value="for_sale">For Sale</option>
          <option value="free">Free</option>
          <option value="lost_pet">Lost Pet</option>
          <option value="event">Event</option>
          <option value="help">Help</option>
          <option value="recommend">Recommend</option>
        </select>
        {(category==='for_sale'||category==='free') && (
          <>
            <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="$" className="w-20 bg-gray-100 text-black text-xs px-3 py-2 rounded-full border" />
            <select value={condition} onChange={e=>setCondition(e.target.value)} className="bg-gray-100 text-black text-xs px-3 py-2 rounded-full border">
              <option value="good">good</option><option value="new">new</option><option value="used">used</option>
            </select>
          </>
        )}
        <button onClick={post} disabled={loading ||!body.trim()} className="ml-auto bg-black text-white text-xs font-black px-6 py-2 rounded-full disabled:opacity-50">{loading?'Posting...':'Post'}</button>
      </div>
    </div>
  )
}
