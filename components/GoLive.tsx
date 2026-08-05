'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive(props: any) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()
  const zip = props.zipCode
  const city = props.city

  const goLive = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) { 
        setError('Please login first')
        setLoading(false)
        return 
      }

      const { data, error } = await supabase.from('posts').insert({
        user_id: uid,
        zip_code: zip,
        city: city,
        body: 'LIVE NOW from ' + city + ' - ' + new Date().toLocaleString(),
        content: 'Someone is live in ' + city + '!',
        category: 'general',
        type: 'live',
        is_live: true,
        live_started_at: new Date().toISOString()
      }).select().single()

      if (error) { 
        setError(error.message)
        setLoading(false)
        return 
      }
      
      setLoading(false)
      setOpen(false)
      
      if (props.onLivePosted && data) props.onLivePosted(data)
      
    } catch (err: any) {
      console.error('Go live error:', err)
      setError('Failed to start live stream')
      setLoading(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Go Live</button>
      
      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <div style={{ background: '#18181b', borderRadius: 16, width: '100%', maxWidth: 400, padding: 20, border: '1px solid '#333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                Go Live in {city}
              </span>
              <button onClick={() => setOpen(false)} style={{ background: '#333', color: 'white', borderRadius: 999, width: 32, height: 32, border: 'none', cursor: 'pointer', fontSize: 16 }}>X</button>
            </div>
            
            <div style={{ background: 'black', borderRadius: 12, overflow: 'hidden', marginBottom: 16, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>Camera</div>
                <span>Live streaming feature</span>
                <div style={{ marginTop: 8, fontSize: 12 }}>Zip: {zip}</div>
              </div>
            </div>
            
            {error && (
              <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}
            
            <button 
              onClick={goLive} 
              disabled={loading}
              style={{ 
                width: '100%', 
                background: loading ? '#666' : '#dc2626', 
                color: 'white', 
                padding: '14px', 
                borderRadius: 999, 
                fontWeight: 'bold', 
                fontSize: 16,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Starting...' : 'Go Live Now'}
            </button>
            
            <div style={{ marginTop: 12, textAlign: 'center', color: '#888', fontSize: 12 }}>
              Only visible to subscribers in {zip}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
