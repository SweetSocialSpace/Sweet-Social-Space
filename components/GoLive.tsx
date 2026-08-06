'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react'

function HostBroadcastView() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasCamera, setHasCamera] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    let mounted = true

    const setupCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        })

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          setHasCamera(true)
        }
      } catch (err) {
        console.error('Camera setup failed:', err)
      }
    }

    setupCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      {hasCamera ? (
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
    try {
      // Request camera/mic permission
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      permissionStream.getTracks().forEach((track) => track.stop())

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please login first')
        return
      }

      const uid = user.id
      const newRoomName = `live-${zip || 'GLOBAL'}-${Date.now()}`

      // Get LiveKit token
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
        const data = await tokenRes.json()
        setError(data.error || 'Failed to get token')
        return
      }

      const tokenData = await tokenRes.json()

      // Create post in database
      const postPayload = {
        body: `LIVE NOW from ${city || 'your area'} - ${new Date().toLocaleString()}`,
        tag: 'live',
        category: 'general',
        zip_code: zip || 'GLOBAL',
        user_id: uid,
        livekit_room: newRoomName,
      }

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert(postPayload)
        .select()
        .single()

      if (postError) {
        console.error('Post creation error:', postError)
        setError('Failed to create post: ' + postError.message)
        return
      }

      if (!postData) {
        setError('Failed to create post')
        return
      }

      setPostId(postData.id)
      setToken(tokenData.token)
      setStreaming(true)

      if (props.onLivePosted) {
        props.onLivePosted(postData)
      }
    } catch (err: any) {
      console.error('Go live error:', err)
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Camera/microphone permission denied. Please allow access in browser settings.')
      } else {
        setError('Failed to start live stream: ' + (err?.message || String(err)))
      }
      setStreaming(false)
    }
  }

  const endLive = async () => {
    if (postId) {
      try {
        const res = await fetch('/api/livekit/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })

        if (!res.ok) {
          const data = await res.json()
          console.error('End live error:', data.error)
        }
      } catch (err) {
        console.error('End live fetch error:', err)
      }
    }

    setStreaming(false)
    setToken('')
    setPostId(null)
    setError('')
  }

  const handleDisconnect = () => {
    endLive()
  }

  if (!streaming) {
    return (
      <button
        type="button"
        onClick={goLive}
        className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold"
      >
        Go Live
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold text-lg">🔴 LIVE in {city}</span>
          <button
            onClick={endLive}
            className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base font-bold"
          >
            X
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          {token && (
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
          )}
        </div>

        <div className="mt-3 text-center text-neutral-500 text-xs">
          You are broadcasting live
        </div>
      </div>
    </div>
  )
}
