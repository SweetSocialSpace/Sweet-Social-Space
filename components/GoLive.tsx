'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive({ userId, zipCode, city, onLivePosted }: any) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const zip = zipCode || 'GLOBAL'
  const cleanCity = (city || 'your area').replace(/, CA, CA/, ', CA')

  const postLive = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || userId
      if (!uid) { alert('Login required to go live'); setSaving(false); return }

      // INSERT with BOTH body and content - covers your schema, so it NEVER disappears
      const payload = {
        user_id: uid,
        zip_code: zip,
        city: cleanCity,
        body: `🔴 LIVE from ${cleanCity} - ${new Date().toLocaleString()}`,
        content: `🔴 LIVE from ${cleanCity} - ${new Date().toLocaleString()}`,
        type: 'live',
        category: 'general'
      }

      const { data, error } = await supabase.from('posts').insert(payload).select().single()

      if (error) {
        console.error('POSTS INSERT FAILED:', error)
        alert('Post failed: ' + error.message + ' - Check Supabase RLS policy for posts')
        setSaving(false)
        return
      }

      // SUCCESS - shows in feed instantly, no reload, no jump, saved forever
      setOpen(false)
      setSaving(false)
      if (data && onLivePosted) onLivePosted(data)
      else if (data) window.dispatchEvent(new CustomEvent('new-live-post', { detail: data }))

    } catch (e: any) {
      console.error(e)
      alert('Live failed: ' + e.message)
      setSaving(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Go Live</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/60 p-4">
          <div className="bg-zinc-900 rounded-2xl w- p-4 border border-white/10">
            <div className="flex justify-between mb-3"><span className="text-white font-bold text-sm">Go Live in {cleanCity}?</span><button onClick={() => setOpen(false)} className="w-6 h-6 bg-zinc-800 rounded-full text-white text-xs">X</button></div>
            <div className="bg-black rounded-xl h- flex items-center justify-center text-white/40 text-xs mb-4">🔴 LIVE Preview • {zip} • {cleanCity}</div>
            <button onClick={postLive} disabled={saving} className="w-full bg-red-600 text-white py-2.5 rounded-full font-bold disabled:opacity-50">{saving? 'Posting...' : `Go Live Now in ${zip}`}</button>
            <button onClick={() => setOpen(false)} disabled={saving} className="w-full mt-2 bg-zinc-800 text-white py-2 rounded-full text-sm">Cancel</button>
            <div className="mt-2 text- text-white/30 text-center">Saves to feed - watchable later</div>
          </div>
        </div>
      )}
    </>
  )
}
