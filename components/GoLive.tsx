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
      if (!uid) { alert('Login required'); setSaving(false); return }

      // FIX: Your posts table columns = user_id, zip_code, city, body, content, category
      // NO type column - removed - per your schema cache error
      const { data, error } = await supabase.from('posts').insert({
        user_id: uid,
        zip_code: zip,
        city: cleanCity,
        body: `🔴 LIVE from ${cleanCity} - ${new Date().toLocaleString()} - Watchable later`,
        content: `🔴 LIVE from ${cleanCity}`,
        category: 'general'
      }).select().single()

      if (error) {
        console.error(error)
        alert('Post failed: ' + error.message)
        setSaving(false)
        return
      }

      setOpen(false)
      setSaving(false)
      if (data && onLivePosted) onLivePosted(data)
    } catch (e: any) {
      alert('Failed: ' + e.message)
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
            <div className="bg-black rounded-xl h- flex items-center justify-center text-white/40 text-xs mb-4">🔴 LIVE • {zip} • {cleanCity}</div>
            <button onClick={postLive} disabled={saving} className="w-full bg-red-600 text-white py-2.5 rounded-full font-bold disabled:opacity-50">{saving? 'Posting...' : `Go Live Now in ${zip}`}</button>
            <button onClick={() => setOpen(false)} className="w-full mt-2 bg-zinc-800 text-white py-2 rounded-full text-sm">Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
