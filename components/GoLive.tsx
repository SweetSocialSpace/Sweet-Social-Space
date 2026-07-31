'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive(props: any) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const zip = props.zipCode || '95122'
  const city = (props.city || 'San Jose, CA').replace(/, CA, CA/, ', CA')

  const postNow = async () => {
    if (saving) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const uid = user?.id || props.userId
    if (!uid) { alert('Login first'); setSaving(false); return }
    const { data, error } = await supabase.from('posts').insert({
      user_id: uid,
      zip_code: zip,
      city: city,
      body: `🔴 LIVE from ${city} - ${new Date().toLocaleString()}`,
      content: `🔴 LIVE from ${city}`,
      category: 'general'
    }).select().single()
    if (error) { alert(error.message); setSaving(false); return }
    setSaving(false)
    setOpen(false)
    if (props.onLivePosted && data) props.onLivePosted(data)
    else if (data) window.location.reload() // fallback - ensures you see it even if feed callback missing
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Go Live</button>
      {open? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
          <div style={{ background: '#18181b', borderRadius: 16, width: 320, padding: 16, height: 'fit-content', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>Go Live in {city}?</span>
              <button onClick={() => setOpen(false)} style={{ background: '#333', color: 'white', borderRadius: 999, width: 24, height: 24 }}>X</button>
            </div>
            <div style={{ background: 'black', borderRadius: 12, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', marginBottom: 12 }}>🔴 {zip} • {city}</div>
            <button onClick={postNow} disabled={saving} style={{ width: '100%', background: saving? '#666' : '#dc2626', color: 'white', padding: '10px', borderRadius: 999, fontWeight: 'bold' }}>{saving? 'Posting...' : 'Go Live Now'}</button>
            <button onClick={() => setOpen(false)} style={{ width: '100%', marginTop: 8, background: '#27272a', color: 'white', padding: '8px', borderRadius: 999 }}>Cancel</button>
          </div>
        </div>
      ) : null}
    </>
  )
}
