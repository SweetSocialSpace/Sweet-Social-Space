'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'
import { Track, RoomEvent } from 'livekit-client'

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
    return () => { room.off('connected', disablePublishing) }
  }, [room])
  return null
}

function HostStreamView() {
  const room = useRoomContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const videoEl = videoRef.current
    const audioEl = audioRef.current
    if (!room) return

    const attachTracks = () => {
      for (const participant of Array.from(room.remoteParticipants.values())) {
        const videoPub = participant.getTrackPublication(Track.Source.Camera)
        if (videoPub?.track && videoEl) {
          videoPub.track.attach(videoEl)
          setHasVideo(true)
        }
        const audioPub = participant.getTrackPublication(Track.Source.Microphone)
        if (audioPub?.track && audioEl) {
          audioPub.track.attach(audioEl)
        }
      }
    }

    attachTracks()
    room.on(RoomEvent.TrackSubscribed, attachTracks)
    room.on(RoomEvent.TrackPublished, attachTracks)

    return () => {
      room.off(RoomEvent.TrackSubscribed, attachTracks)
      room.off(RoomEvent.TrackPublished, attachTracks)
      for (const participant of Array.from(room.remoteParticipants.values())) {
        participant.getTrackPublication(Track.Source.Camera)?.track?.detach(videoEl!)
        participant.getTrackPublication(Track.Source.Microphone)?.track?.detach(audioEl!)
      }
    }
  }, [room])

  return (
    <div className="relative w-full h-full bg-black">
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white">Waiting for stream to start...</p>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <audio ref={audioRef} autoPlay playsInline />
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
          <span className="text-white font-bold text-lg">🔴 {userName} is LIVE</span>
          <button onClick={onClose} className="bg-neutral-700 text-white rounded-full w-8 h-8 border-none cursor-pointer text-base">X</button>
        </div>
        {error && <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {loading? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4 animate-pulse">🔴</div>
            <p className="text-neutral-400">Joining stream...</p>
          </div>
        ) : token? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              onDisconnected={onClose}
              audio={true}
              video={true}
            >
              <ViewerOnlyEnforcer />
              <HostStreamView />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        ) : null}
        <div className="mt-3 text-center text-neutral-500 text-xs">Watch only — your camera and microphone are not shared</div>
      </div>
    </div>
  )
}
