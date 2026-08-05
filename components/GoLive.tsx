'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive(props: any) {
  const [open, setOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()
  const zip = props.zipCode || '95122'
  const city = (props.city || 'San Jose, CA').replace(/, CA, CA/, ', CA')

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

  const startRecording = () => {
    if (!stream) return
    
    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    mediaRecorderRef.current = mediaRecorder
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      await uploadVideo(blob)
    }
    
    mediaRecorder.start()
    setRecording(true)
    setRecordingTime(0)
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const uploadVideo = async (blob: Blob) => {
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) { alert('Login first'); setUploading(false); return }

      // Upload to Supabase Storage
      const fileName = `live-${uid}-${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('livestreams')
        .upload(fileName, blob)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        // Fallback: create post without video
        await createPostWithoutVideo(uid)
        setUploading(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('livestreams')
        .getPublicUrl(fileName)

      // Create post with video
      const { data, error } = await supabase.from('posts').insert({
        user_id: uid,
        zip_code: zip,
        city: city,
        body: `🔴 LIVE from ${city} - ${new Date().toLocaleString()}`,
        content: `🔴 LIVE from ${city}`,
        category: 'general',
        video_url: publicUrl,
        media_url: publicUrl,
        media_type: 'video',
        type: 'live'
      }).select().single()

      if (error) { alert(error.message); setUploading(false); return }
      
      setUploading(false)
      setOpen(false)
      stopCamera()
      
      if (props.onLivePosted && data) props.onLivePosted(data)
      else if (data) window.location.reload()
      
    } catch (err: any) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const createPostWithoutVideo = async (uid: string) => {
    const { data, error } = await supabase.from('posts').insert({
      user_id: uid,
      zip_code: zip,
      city: city,
      body: `🔴 LIVE from ${city} - ${new Date().toLocaleString()}`,
      content: `🔴 LIVE from ${city}`,
      category: 'general',
      type: 'live'
    }).select().single()

    if (error) { alert(error.message); return }
    
    setOpen(false)
    stopCamera()
    
    if (props.onLivePosted && data) props.onLivePosted(data)
    else if (data) window.location.reload()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          <div style={{ background: '#18181b', borderRadius: 16, width: '100%', maxWidth: 480, padding: 20, border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Go Live in {city}</span>
              <button onClick={() => { setOpen(false); stopRecording(); }} style={{ background: '#333', color: 'white', borderRadius: 999, width: 32, height: 32, border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            
            <div style={{ position: 'relative', background: 'black', borderRadius: 12, overflow: 'hidden', marginBottom: 16, aspectRatio: '4/3' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {recording && (
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(220, 38, 38, 0.9)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                  LIVE {formatTime(recordingTime)}
                </div>
              )}
              {!stream && !error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📹</div>
                  <span>Starting camera...</span>
                </div>
              )}
            </div>
            
            {error && (
              <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 12 }}>
              {!recording ? (
                <button 
                  onClick={startRecording} 
                  disabled={!stream || uploading}
                  style={{ 
                    flex: 1, 
                    background: (!stream || uploading) ? '#666' : '#dc2626', 
                    color: 'white', 
                    padding: '14px', 
                    borderRadius: 999, 
                    fontWeight: 'bold', 
                    fontSize: 16,
                    border: 'none',
                    cursor: (!stream || uploading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Start Recording'}
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  disabled={uploading}
                  style={{ 
                    flex: 1, 
                    background: uploading ? '#666' : '#333', 
                    color: 'white', 
                    padding: '14px', 
                    borderRadius: 999, 
                    fontWeight: 'bold', 
                    fontSize: 16,
                    border: 'none',
                    cursor: uploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Stop & Post'}
                </button>
              )}
            </div>
            
            <div style={{ marginTop: 12, textAlign: 'center', color: '#888', fontSize: 12 }}>
              🔴 Only visible to subscribers in {zip}
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
