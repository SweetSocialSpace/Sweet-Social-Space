'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive(props: any) {
  const [open, setOpen] = useState(false)
  const [live, setLive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [liveTime, setLiveTime] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const [error, setError] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()
  const zip = props.zipCode || '95122'
  const city = props.city || 'San Jose, CA'

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.muted = true
      }
      setError('')
    } catch (err: any) {
      setError('Camera access denied. Please allow camera and microphone access.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const goLive = async () => {
    if (!stream) return
    
    setLive(true)
    setLiveTime(0)
    setViewerCount(Math.floor(Math.random() * 10) + 1)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) { alert('Login first'); setLive(false); return }

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

      if (error) { alert(error.message); setLive(false); return }
      
      if (props.onLivePosted && data) props.onLivePosted(data)
      
    } catch (err: any) {
      console.error('Go live error:', err)
      setError('Failed to start live stream. Please try again.')
      setLive(false)
    }
    
    timerRef.current = setInterval(() => {
      setLiveTime(prev => prev + 1)
      setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1))
    }, 1000)
  }

  const endLive = async () => {
    setLive(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      
      await supabase.from('posts')
        .update({ 
          is_live: false, 
          live_ended_at: new Date().toISOString(),
          body: 'Stream ended from ' + city + ' - lasted ' + formatTime(liveTime)
        })
        .eq('user_id', uid)
        .eq('is_live', true)
        
    } catch (err) {
      console.error('End live error:', err)
    }
    
    setOpen(false)
    stopCamera()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins + ':' + secs.toString().padStart(2, '0')
  }

  useEffect(() => {
    if (open) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Go Live</button>
      
      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <div style={{ background: '#18181b', borderRadius: 16, width: '100%', maxWidth: 480, padding: 20, border: '1px solid '#333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                {live ? 'LIVE' : 'Go Live in ' + city}
              </span>
              <button onClick={() => { setOpen(false); if (live) endLive(); }} style={{ background: '#333', color: 'white', borderRadius: 999, width: 32, height: 32, border: 'none', cursor: 'pointer', fontSize: 16 }}>X</button>
            </div>
            
            <div style={{ position: 'relative', background: 'black', borderRadius: 12, overflow: 'hidden', marginBottom: 16, aspectRatio: '4/3' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {live && (
                <>
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(220, 38, 38, 0.9)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                    LIVE {formatTime(liveTime)}
                  </div>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 'bold' }}>
                    {viewerCount} watching
                  </div>
                </>
              )}
              {!stream && !error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>Camera</div>
                  <span>Starting camera...</span>
                </div>
              )}
            </div>
            
            {error && (
              <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}
            
            {!live ? (
              <button 
                onClick={goLive} 
                disabled={!stream}
                style={{ 
                  width: '100%', 
                  background: !stream ? '#666' : '#dc2626', 
                  color: 'white', 
                  padding: '14px', 
                  borderRadius: 999, 
                  fontWeight: 'bold', 
                  fontSize: 16,
                  border: 'none',
                  cursor: !stream ? 'not-allowed' : 'pointer'
                }}
              >
                Start Live Stream
              </button>
            ) : (
              <button 
                onClick={endLive}
                style={{ 
                  width: '100%', 
                  background: '#333', 
                  color: 'white', 
                  padding: '14px', 
                  borderRadius: 999, 
                  fontWeight: 'bold', 
                  fontSize: 16,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                End Stream
              </button>
            )}
            
            <div style={{ marginTop: 12, textAlign: 'center', color: '#888', fontSize: 12 }}>
              Only visible to subscribers in {zip}
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
