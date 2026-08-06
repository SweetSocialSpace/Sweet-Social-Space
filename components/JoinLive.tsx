'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import { Track, RoomEvent } from 'livekit-client'

// Force viewer's mic and camera OFF the moment they connect
function ViewerOnlyEnforcer() {
  const room = useRoomContext()

  useEffect(() => {
    if (!room?.localParticipant) return

    const disablePublishing = async () => {
      await room.localParticipant.setMicrophoneEnabled(false)
      await room.localParticipant.setCameraEnabled(false)

      room.localParticipant.trackPublications.forEach((pub) => {
        if (pub.track) {
          room.localParticipant.unpublishTrack(pub.track)
        }
      })
    }

    disablePublishing()

    room.on('connected', disablePublishing)
    return () => {
      room.off('connected', disablePublishing)
    }
  }, [room])

  return null
}

// Shows ONLY the host's video (the person who is broadcasting)
function HostStreamView() {
  const room = useRoomContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl || !room) return

    const attachHostVideo = () => {
      for (const participant of room.remoteParticipants.values()) {
        const publication = participant.getTrackPublication(Track.Source.Camera)
        if (publication?.track) {
          publication.track.attach(videoEl)
          setHasVideo(true)
          return
        }
      }
    }

    attachHostVideo()

    const onTrackSubscribed = () => {
      attachHostVideo()
    }

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed)

    return () => {
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed)
      for (const participant of room.remoteParticipants.values()) {
        const publication = participant.getTrackPublication(Track.Source.Camera)
        publication?.track?.detach(videoEl)
      }
    }
  }, [room])

  if (!hasVideo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Waiting for stream to start...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  )
}

  return (
    <div className="relative w-full h-full">
      <VideoTrack
        trackRef={hostCamera}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default function JoinLive({
  roomName,
  userName,
  onClose,
}: {
  roomName: string
  userName: string
  onClose: () => void
}) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const joinStream = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'viewer-' + Date.now()

        const tokenRes = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomName,
            participantName: uid,
            role: 'viewer',
          }),
        })

        if (!tokenRes.ok) {
          const errorData = await tokenRes.json()
          setError(errorData.error || 'Failed to join stream')
          setLoading(false)
          return
        }

        const tokenData = await tokenRes.json()
        setToken(tokenData.token)
        setLoading(false)
      } catch (err: any) {
        console.error('Join live error:', err)
        setError('Failed to join stream: ' + err.message)
        setLoading(false)
      }
    }

    joinStream()
  }, [roomName, supabase])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold text-lg">
            🔴 {userName} is LIVE
          </span>
          <button
            onClick={onClose}
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🔴</div>
            <p className="text-neutral-400">Joining stream...</p>
          </div>
        ) : token ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              onDisconnected={onClose}
              audio={false}
              video={false}
            >
              <ViewerOnlyEnforcer />
              <HostStreamView />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        ) : null}

        <div className="mt-3 text-center text-neutral-500 text-xs">
          Watch only — your camera and microphone are not shared
        </div>
      </div>
    </div>
  )
}
