'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLive(props: any) {
  const [open, setOpen] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const supabase = createClient()
  const zip = props.zipCode
  const city = props.city

  const goLive = async () => {
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
      
      setStreaming(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) { 
        setError('Please login first')
        setStreaming(false)
        return 
      }

      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
      const roomName = `live-${zip}-${Date.now()}`

      const { data, error } = await supabase.from('posts').insert({
        user_id: uid,
        zip_code: zip,
        body: 'LIVE NOW from ' + city + ' - ' + new Date().toLocaleString(),
        tag: 'live',
        category: 'general',
        livekit_room: roomName,
        livekit_url: livekitUrl
      }).select().single()

      if (error) { 
        setError(error.message)
        setStreaming(false)
        return 
      }
      
      if (props.onLivePosted && data) props.onLivePosted(data)
      
    } catch (err: any) {
      console.error('Go live error:', err)
      setError('Failed to start live stream: ' + err.message)
      setStreaming(false)
    }
  }

  const endLive = async () => {
    setStreaming(false)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setOpen(false)
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Go Live</button>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-md p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold text-lg">
            {streaming ? 'LIVE' : 'Go Live in ' + city}
          </span>
          <button onClick={() => { setOpen(false); if (streaming) endLive(); }} className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base">X</button>
        </div>
        
        <div className="relative bg-black rounded-xl overflow-hidden mb-4 aspect-video">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
          {streaming && (
            <div className="absolute top-3 left-3 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          {!stream && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
              <div className="text-3xl mb-2">Camera</div>
              <span>Ready to stream</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        {!streaming ? (
          <button 
            onClick={goLive} 
            className="w-full bg-red-600 text-white p-3.5 rounded-full font-bold text-base border-none cursor-pointer"
          >
            Start Live Stream
          </button>
        ) : (
          <button 
            onClick={endLive}
            className="w-full bg-neutral-700 text-white p-3.5 rounded-full font-bold text-base border-none cursor-pointer"
          >
            End Stream
          </button>
        )}
        
        <div className="mt-3 text-center text-neutral-500 text-xs">
          Only visible to subscribers in {zip}
        </div>
      </div>
    </div>
  )
}
