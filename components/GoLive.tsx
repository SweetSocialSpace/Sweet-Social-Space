'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'

function HostBroadcastView() {
  const room = useRoomContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasCamera, setHasCamera] = useState(false)

  useEffect(() => {
    if (!room || !videoRef.current) return

    const setupLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        })

        streamRef.current = stream
        const videoEl = videoRef.current
        if (videoEl) {
          videoEl.srcObject = stream
          setHasCamera(true)
        }
      } catch (error) {
        console.error('Error getting camera stream:', error)
      }
    }

    setupLocalStream()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [room])

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
  const [roomName, setRoomName] = useState('')
  const [postId, setPostId] = useState<string | null>(null)

  const supabase = createClient()
  const zip = props.zipCode
  const city = props.city

  const goLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      stream.getTracks().forEach((track) => track.stop())

      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) {
        setError('Please login first')
        return
      }

      const newRoomName = `live-${zip}-${Date.now()}`
      setRoomName(newRoomName)

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
        const errorData = await tokenRes.json()
        setError(errorData.error || 'Failed to get token')
        return
      }

      const tokenData = await tokenRes.json()
      setToken(tokenData.token)

      const payload: any = {
        body: 'LIVE NOW from ' + city + ' - ' + new Date().toLocaleString(),
        tag: 'live',
        category: 'general',
        zip_code: zip || 'GLOBAL',
        user_id: uid,
        livekit_room: newRoomName,
      }
      const { data, error } = await supabase.from('posts').insert(payload).select().single()

      if (error) {
        console.error('Database insert error:', error)
        setError('Database error: ' + error.message)
        return
      }

      if (data) {
        setPostId(data.id)
        setStreaming(true)
        if (props.onLivePosted) props.onLivePosted(data)
      }
    } catch (err: any) {
      console.error('Go live error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera/microphone permission denied. Please allow access in your browser settings.')
      } else {
        setError('Failed to start live stream: ' + err.message)
      }
      setStreaming(false)
    }
  }

  const endLive = async () => {
    try {
      if (postId) {
        await supabase.from('posts').update({
          tag: 'live_ended',
        }).eq('id', postId)
      }
    } catch (err) {
      console.error('Error ending live:', err)
    }

    setStreaming(false)
    setToken('')
    setError('')
    setPostId(null)
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
          <span className="text-white font-bold text-lg">
            🔴 LIVE in {city}
          </span>
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
