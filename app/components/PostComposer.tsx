"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function PostComposer({ postType, zipDefault='95122' }: { postType: 'neighborhood'|'vent'|'faith', zipDefault?: string }) {
  const [body, setBody] = useState('')
  const [anonymous, setAnonymous] = useState(postType === 'vent')
  const [zip, setZip] = useState(zipDefault)
  const [loading, setLoading] = useState(false)
  const supabase = supabaseBrowser()

  const submit = async () => {
    if (!body.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Sign in first – top right'); setLoading(false); return }
    const { error } = await supabase.from('posts').insert({
      user_id: anonymous ? null : user.id,
      body: body.trim(),
      post_type: postType,
      is_anonymous: anonymous,
      zip_code: zip,
      city: 'San Jose, CA'
    })
    setLoading(false)
    if (error) { alert(error.message); return }
    setBody('')
    location.reload()
  }

  const placeholders = {
    neighborhood: "What's happening in your neighborhood?",
    vent: "Say what's on your mind. No judgment. Let it out.",
    faith: "Share a prayer request, encouragement, or testimony…"
  }

  return (
    <div className="card mb-4">
      <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={2000}
        placeholder={placeholders[postType]}
        className="input h-24 resize-none" />
      <div className="flex items-center justify-between mt-2 text-sm">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} />
            Post anonymously
          </label>
          <input value={zip} onChange={e=>setZip(e.target.value)} className="border rounded-lg px-2 py-1 w-20" placeholder="zip" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">{body.length}/2000</span>
          <button onClick={submit} disabled={loading || !body.trim()} className="btn">{loading ? '…' : 'Post'}</button>
        </div>
      </div>
    </div>
  )
}
