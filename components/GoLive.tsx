'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react'

/**
 * HostBroadcastView: Camera preview using native getUserMedia (not LiveKit track attachment)
 * LiveKit handles the server-side publishing in the background
 * This component just displays what the user sees locally
 */
function HostBroadcastView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) {
      console.warn('Video element not mounted')
      return
    }

    let isMounted = true
    let localStream: MediaStream | null = null

    const setupCamera = async () => {
      try {
        console.log('Starting getUserMedia...')
        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        })

        if (!isMounted) {
          console.log('Component unmounted, stopping tracks')
          localStream.getTracks().forEach((t) => t.stop())
          return
        }

        console.log('Got media stream, attaching to video element')
        streamRef.current = localStream
        videoEl.srcObject = localStream

        // Wait for video to start playing
        const onCanPlay = () => {
          console.log('Video can play')
          if (isMounted) {
            setHasCamera(true)
            setCameraError(null)
          }
          videoEl.removeEventListener('canplay', onCanPlay)
        }

        videoEl.addEventListener('canplay', onCanPlay)

        // Timeout in case canplay never fires
        const timeoutId = setTimeout(() => {
          if (!hasCamera && isMounted) {
            console.log('Timeout waiting for canplay, setting hasCamera anyway')
            setHasCamera(true)
          }
        }, 2000)

        return () => clearTimeout(timeoutId)
      } catch (err: any) {
        console.error('getUserMedia error:', err)
        if (isMounted) {
          setCameraError(
            err?.name === 'NotAllowedError'
              ? 'Camera permission denied'
              : err?.message || 'Camera failed'
          )
        }
      }
    }

    setupCamera()

    return () => {
      isMounted = false
      if (streamRef.current) {
        console.log('Cleanup: stopping camera stream')
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      {cameraError ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-400 text-center px-4">{cameraError}</p>
        </div>
      ) : hasCamera ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-white">Starting camera...</p>
        </div>
      )}
      <RoomAudioRenderer />
    </div>
  )
}

export default function GoLive(props: any) {
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [postId, setPostId] = useState<string | null>(null)

  const supabase = createClient()
  const zip = props.zipCode
  const city = props.city

  const goLive = async () => {
    setError('')
    try {
      // 1. Request camera/mic permission
      const permStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      permStream.getTracks().forEach((t) => t.stop())
      console.log('Permissions granted')

      // 2. Get user ID
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) {
        setError('Please login first')
        return
      }
      console.log('User ID:', uid)

      // 3. Generate room name scoped to zip code
      const newRoomName = `live-${zip || 'GLOBAL'}-${Date.now()}`
      console.log('Room name:', newRoomName)

      // 4. Get LiveKit token
      const tokenRes = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: newRoomName,
          participantName: uid,
          role: 'host',
        }),
      })

      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}))
        setError(errData.error || 'Failed to get LiveKit token')
        return
      }

      const tokenData = await tokenRes.json()
      console.log('Got token')

      // 5. Create post in database
      const payload = {
        body: `LIVE NOW from ${city || 'your area'} - ${new Date().toLocaleString()}`,
        tag: 'live',
        category: 'general',
        zip_code: zip || 'GLOBAL',
        user_id: uid,
        livekit_room: newRoomName,
      }

      const { data, error: dbError } = await supabase
        .from('posts')
        .insert(payload)
        .select()
        .single()

      if (dbError) {
        console.error('Post insert error:', dbError)
        setError('Failed to create post: ' + dbError.message)
        return
      }

      if (!data) {
        setError('Post creation returned no data')
        return
      }

      console.log('Post created:', data.id)

      // 6. Set token and postId, then show video
      setPostId(data.id)
      setToken(tokenData.token)
      setStreaming(true)

      if (props.onLivePosted) {
        props.onLivePosted(data)
      }
    } catch (err: any) {
      console.error('goLive exception:', err)
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Camera/mic permission denied. Check your browser settings.')
      } else {
        setError('Error starting live: ' + (err?.message || String(err)))
      }
      setStreaming(false)
    }
  }

  const endLive = async () => {
    try {
      if (postId) {
        console.log('Calling /api/livekit/end for postId:', postId)
        const res = await fetch('/api/livekit/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          console.error('endLive API error:', errData.error || res.statusText)
        } else {
          console.log('endLive API success')
        }
      }
    } catch (err: any) {
      console.error('endLive exception:', err)
    } finally {
      setStreaming(false)
      setToken('')
      setPostId(null)
      setError('')
    }
  }

  const handleDisconnect = () => {
    console.log('LiveKit room disconnected')
    endLive()
  }

  // Not streaming: show button
  if (!streaming) {
    return (
      <button
        type="button"
        onClick={goLive}
        className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-700 transition"
      >
        Go Live
      </button>
    )
  }

  // Streaming: show modal with camera feed
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl p-6 border border-neutral-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-red-600 text-2xl animate-pulse">â—</span>
            LIVE in {city}
          </h2>
          <button
            onClick={endLive}
            className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition"
          >
            âœ•
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Video feed */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-lg">
          {token ? (
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              onDisconnected={handleDisconnect}
              video={true}
              audio={true}
            >
              <HostBroadcastView />
            </LiveKitRoom>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <p className="text-white">Connecting...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-neutral-400 text-xs">
          You are broadcasting live â€¢ {zip} â€¢ Viewers can watch, cannot use camera or mic
        </div>
      </div>
    </div>
  )
}

