'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveKitRoom, VideoTrack, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'

function MyVideo() {
  const tracks = useTracks([Track.Source.Camera])
  const trackRef = tracks[0]
  if (!trackRef) return <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white">Camera off</div>
  return <VideoTrack trackRef={trackRef} className="w-full aspect-video rounded-xl bg-black object-cover" />
}

export default function GoLive({ userId, zipCode, city, onLivePosted, onLiveEnded }: { userId?: string, zipCode: string, city: string, onLivePosted: (p:any)=>void, onLiveEnded: (id:string)=>void }) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState('')
  const [roomName, setRoomName] = useState('')
  const [postId, setPostId] = useState<string>('')
  const [egressId, setEgressId] = useState<string>('')
  const supabase = createClient()

  const startLive = async () => {
    const rName = `live-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setRoomName(rName)
    const res = await fetch('/api/livekit/token', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ roomName: rName, participantName: userId||'host', role: 'host' }) })
    const data = await res.json()
    setToken(data.token)
    const { data: post } = await supabase.from('posts').insert({ user_id: userId, body: `LIVE NOW from ${city} - ${new Date().toLocaleString()}`, tag: 'live', zip_code: zipCode, livekit_room: rName }).select().single()
    if (post) { setPostId(post.id); onLivePosted(post) }
    // Start recording to bucket
    try {
      const eg = await fetch('/api/livekit/egress/start', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ roomName: rName, postId: post?.id }) })
      const egData = await eg.json()
      if (egData.egressId) setEgressId(egData.egressId)
    } catch {}
    setOpen(true)
  }

  const endLive = async () => {
    try {
      if (egressId) await fetch('/api/livekit/egress/stop', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ egressId, postId, roomName }) })
      await fetch('/api/livekit/end', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ postId, roomName }) })
      if (postId) onLiveEnded(postId)
    } catch {}
    setOpen(false); setToken(''); setRoomName(''); setPostId(''); setEgressId('')
  }

  if (!open) return <button onClick={startLive} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs">Go Live</button>

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4"><span className="text-white font-bold">🔴 Live - {city}</span><button onClick={endLive} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">End Live</button></div>
        {token && <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect audio video><MyVideo /></LiveKitRoom>}
        <div className="text-xs text-neutral-400 mt-3">Recording to replays - viewers can watch later. Click End Live and it will become Was Live with replay.</div>
      </div>
    </div>
  )
}
