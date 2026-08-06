'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'

// Host-only view — shows ONLY the broadcaster's camera (not viewers)
function HostBroadcastView() {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false }
  )
  const localCamera = tracks.find(
    (t) => t.participant.isLocal && t.source === Track.Source.Camera
  )

  return (
    <div className="relative w-full h-full">
      {localCamera ? (
        <VideoTrack
          trackRef={localCamera}
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
  const [open, setOpen] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [roomName, setRoomName] = useState('')

  const supabase = createClient()
  const zip = props.zipCode
  const city = props.city

  const goLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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
      setStreaming(true)

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
        setError('Database error: ' + error.message + ' (Code: ' + error.code + ')')
        setStreaming(false)
        return
      }

      if (props.onLivePosted && data) props.onLivePosted(data)
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
    setStreaming(false)
    setToken('')
    setOpen(false)
  }

  const handleDisconnect = () => {
    console.log('LiveKit disconnected normally')
    endLive()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
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
            {streaming ? '🔴 LIVE' : 'Go Live in ' + city}
          </span>
          <button
            onClick={() => { setOpen(false); if (streaming) endLive() }}
            className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base"
          >
            X
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!streaming ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📹</div>
            <p className="text-neutral-400 mb-6">Ready to start live streaming</p>
            <button
              onClick={goLive}
              className="bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg border-none cursor-pointer"
            >
              Start Live Stream
            </button>
          </div>
        ) : (
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
        )}

        <div className="mt-3 text-center text-neutral-500 text-xs">
          You are broadcasting — viewers can watch but cannot use their camera or mic
        </div>
      </div>
    </div>
  )
}
