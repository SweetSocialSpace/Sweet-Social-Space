'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveKitRoom, VideoTrack, useLocalParticipant, RoomAudioRenderer } from '@livekit/components-react'
import { Track } from 'livekit-client'

function HostView() {
  const { localParticipant } = useLocalParticipant()
  const camPub = localParticipant.getTrackPublication(Track.Source.Camera)
  const track = camPub?.videoTrack

  if (!track) return <div className="flex h-full items-center justify-center text-white">Starting camera...</div>
  
  return <VideoTrack trackRef={{ publication: camPub, participant: localParticipant, source: Track.Source.Camera }} className="w-full h-full object-cover" />
}

export default function GoLive(props: any) {
  const [streaming, setStreaming] = useState(false)
  const [token, setToken] = useState('')
  const [postId, setPostId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()
  const zip = props.zipCode // NEVER hardcode, comes from props
  const city = props.city

  const goLive = async () => {
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || props.userId
      if (!uid) { setError('Please login'); return }

      const roomName = `live-${zip || 'GLOBAL'}-${Date.now()}`

      const tokenRes = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName: uid, role: 'host' })
      })
      if (!tokenRes.ok) throw new Error('Token failed')
      const { token: tk } = await tokenRes.json()

      const { data, error: dbErr } = await supabase.from('posts').insert({
        body: `LIVE NOW from ${city || 'your area'} - ${new Date().toLocaleString()}`,
        tag: 'live',
        category: 'general',
        zip_code: zip || 'GLOBAL',
        user_id: uid,
        livekit_room: roomName,
      }).select().single()

      if (dbErr) throw dbErr

      setPostId(data.id)
      setToken(tk)
      setStreaming(true)
      props.onLivePosted?.(data)

    } catch (e:any) {
      if (e.name === 'NotAllowedError') setError('Allow camera/mic in browser')
      else setError(e.message)
    }
  }

  const endLive = async () => {
  try {
    if (postId) {
      await fetch('/api/livekit/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      props.onLiveEnded?.(postId)
    }
  } finally {
    setStreaming(false); setToken(''); setPostId(null)
  }
}

  if (!streaming) return <button onClick={goLive} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Go Live</button>

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl p-6 border border-neutral-700">
        <div className="flex justify-between mb-4">
          <h2 className="text-white font-bold">LIVE in {city}</h2>
          <button onClick={endLive} className="bg-neutral-700 text-white w-8 h-8 rounded-full">X</button>
        </div>
        {error && <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded mb-4">{error}</div>}
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect video audio onDisconnected={endLive}>
            <HostView /><RoomAudioRenderer />
          </LiveKitRoom>
        </div>
        <div className="text-center text-neutral-400 text-xs mt-3">Broadcasting live in {zip}</div>
      </div>
    </div>
  )
}
