'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveKitRoom, VideoTrack, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'

function MyVideo() {
  const tracks = useTracks([Track.Source.Camera])
  const trackRef = tracks[0]
  if (!trackRef) return <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white">Starting camera...</div>
  return <VideoTrack trackRef={trackRef} className="w-full aspect-video rounded-xl bg-black object-cover" />
}

export default function GoLive({ userId, zipCode, city, onLivePosted, onLiveEnded }: { userId?: string, zipCode: string, city: string, onLivePosted: (p:any)=>void, onLiveEnded: (id:string)=>void }) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState('')
  const [roomName, setRoomName] = useState('')
  const [postId, setPostId] = useState<string>('')
  const [egressId, setEgressId] = useState('')
  const supabase = createClient()

  const startLive = async () => {
    // Use exactly what the feed gives us - which is the user's zip, whatever it is in the world
    const cleanZip = zipCode || 'GLOBAL'
    const cleanCity = city || ''

    const rName = `live-${Date.now()}`
    setRoomName(rName)
    const res = await fetch('/api/livekit/token', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ roomName: rName, participantName: userId||'host', role: 'host' }) })
    const data = await res.json()
    setToken(data.token)

   // Remove zip code from city string if it exists
const cleanCityOnly = cleanCity.replace(/^[\d,]+,\s*/, '').replace(/^[0-9]+,\s*/, '')
const bodyText = cleanCityOnly? `LIVE NOW from ${cleanZip}, ${cleanCityOnly} - ${new Date().toLocaleString()}` : `LIVE NOW from ${cleanZip} - ${new Date().toLocaleString()}`

    const { data: post } = await supabase.from('posts').insert({
      user_id: userId,
      body: bodyText,
      tag: 'live',
      zip_code: cleanZip,
      livekit_room: rName
    }).select().single()

    if (post) { setPostId(post.id); onLivePosted(post) }
    setOpen(true)

    // Start LiveKit egress recording (server-side, no 50MB limit)
    setTimeout(async () => {
      try {
        const egressRes = await fetch('/api/livekit/egress/start', { 
          method:'POST', 
          headers:{'Content-Type':'application/json'}, 
          body: JSON.stringify({ roomName: rName }) 
        })
        const egressData = await egressRes.json()
        if (egressData.egressId) {
          console.log('LiveKit egress started:', egressData.egressId)
          setEgressId(egressData.egressId)
        }
      } catch (error) {
        console.error('Error starting egress:', error)
      }
    }, 2000)
  }

  const endLive = async () => {
    // Stop LiveKit egress recording
    if (egressId) {
      try {
        await fetch('/api/livekit/egress/stop', { 
          method:'POST', 
          headers:{'Content-Type':'application/json'}, 
          body: JSON.stringify({ egressId, postId, roomName }) 
        })
        console.log('LiveKit egress stopped:', egressId)
      } catch (error) {
        console.error('Error stopping egress:', error)
      }
    }

    // Update post to mark as ended
   const cleanCityOnly = city.replace(/^[\d,]+,\s*/, '').replace(/^[0-9]+,\s*/, '')
const wasBody = cleanCityOnly? `Was Live from ${zipCode}, ${cleanCityOnly} - ${new Date().toLocaleString()}` : `Was Live from ${zipCode} - ${new Date().toLocaleString()}`
    await supabase.from('posts').update({ 
      tag: 'live_ended', 
      body: wasBody 
    }).eq('id', postId)

    // End the LiveKit room
    try { 
      await fetch('/api/livekit/end', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ postId, roomName }) 
      }) 
    } catch (error) {
      console.error('Error ending LiveKit room:', error)
    }

    if (postId) onLiveEnded(postId)
    setOpen(false); setToken(''); setRoomName(''); setPostId(''); setEgressId('')
  }

  if (!open) return <button onClick={startLive} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs">Go Live</button>

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold">🔴 Live - {zipCode} {city? `, ${city}` : ''}</span>
          <button onClick={endLive} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm">End Live - Save Replay</button>
        </div>
        {token && <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect audio video><MyVideo /></LiveKitRoom>}
        <div className="text-xs text-white/60 mt-3">Live in {zipCode} - worldwide - video will be saved for replay.</div>
      </div>
    </div>
  )
}
