'use client'
import { useState, useEffect } from 'react'
import { LiveKitRoom, VideoTrack, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'

function ViewerView() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false })
  const hostTrack = tracks.find(t => t.participant.isCameraEnabled)

  if (!hostTrack) {
    return <div className="flex h-full items-center justify-center text-white">Waiting for host to start video...</div>
  }

  return <VideoTrack trackRef={hostTrack} className="w-full h-full object-cover" />
}

export default function JoinLive({ roomName, userName, onClose }: any) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function getViewerToken() {
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomName, // same room as the live post, NOT a new room
            participantName: userName || `viewer-${Date.now()}`,
            role: 'viewer' // THIS IS THE FIX - viewer not host
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setToken(data.token)
      } catch (e:any) {
        setError(e.message)
      }
    }
    getViewerToken()
  }, [roomName, userName])

  if (error) return <div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-red-400">{error} <button onClick={onClose} className="ml-4 bg-white text-black px-4 py-2 rounded-full">Close</button></div>

  if (!token) return <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center text-white">Joining live...</div>

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl p-6 border border-neutral-700">
        <div className="flex justify-between mb-4">
          <h2 className="text-white font-bold">Watching Live in {roomName}</h2>
          <button onClick={onClose} className="bg-neutral-700 text-white w-8 h-8 rounded-full">X</button>
        </div>
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect video={false} audio={false}>
            <ViewerView />
          </LiveKitRoom>
        </div>
        <div className="text-center text-neutral-400 text-xs mt-3">You are watching, not broadcasting</div>
      </div>
    </div>
  )
}
