'use client'
import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveKitRoom, VideoTrack, useTracks, useLocalParticipant } from '@livekit/components-react'
import { Track } from 'livekit-client'

function MyVideoAndRecorder({ onReady }: { onReady: (recorder: MediaRecorder) => void }) {
  const tracks = useTracks([Track.Source.Camera])
  const trackRef = tracks[0]
  const { localParticipant } = useLocalParticipant()
  const startedRef = useRef(false)

  // Start MediaRecorder from LiveKit's actual published tracks
  const startRecordingIfReady = useCallback(async () => {
    if (startedRef.current ||!localParticipant) return

    // Get the MediaStream from LiveKit's local participant
    const videoPub = localParticipant.getTrackPublication(Track.Source.Camera)
    const audioPub = localParticipant.getTrackPublication(Track.Source.Microphone)

    if (!videoPub?.track || startedRef.current) return

    const stream = new MediaStream()
    if (videoPub.track?.mediaStreamTrack) stream.addTrack(videoPub.track.mediaStreamTrack)
    if (audioPub?.track?.mediaStreamTrack) stream.addTrack(audioPub.track.mediaStreamTrack)

    if (stream.getTracks().length === 0) return

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' })
    startedRef.current = true
    onReady(recorder)
  }, [localParticipant, onReady])

  if (trackRef) {
    // Trigger recording once we have a track
    startRecordingIfReady()
    return <VideoTrack trackRef={trackRef} className="w-full aspect-video rounded-xl bg-black object-cover" />
  }

  return <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white">Starting camera...</div>
}

export default function GoLive({ userId, zipCode, city, onLivePosted, onLiveEnded }: any) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState('')
  const [roomName, setRoomName] = useState('')
  const [postId, setPostId] = useState('')
  const [isEnding, setIsEnding] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const supabase = createClient()

  const handleRecorderReady = (recorder: MediaRecorder) => {
    chunksRef.current = []
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.start(1000)
    mediaRecorderRef.current = recorder
  }

  const startLive = async () => {
    setIsEnding(false)
    const cleanZip = zipCode || 'GLOBAL'
    const rName = `live-${Date.now()}`
    setRoomName(rName)

    const res = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName: rName, participantName: userId || 'host', role: 'host' })
    })
    const data = await res.json()
    setToken(data.token)

    const { data: post } = await supabase.from('posts').insert({
      user_id: userId,
      body: `LIVE NOW from ${cleanZip} - ${new Date().toLocaleString()}`,
      tag: 'live',
      zip_code: cleanZip,
      livekit_room: rName
    }).select().single()

    if (post) {
      setPostId(post.id)
      onLivePosted(post)
    }
    setOpen(true)
  }

  const endLive = async () => {
    if (isEnding) return
    setIsEnding(true)

    let finalVideoUrl = ''

    // 1. Stop recorder and upload
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state!== 'inactive') {
      finalVideoUrl = await new Promise<string>(resolve => {
        recorder.onstop = async () => {
          try {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' })
            if (blob.size > 1000 && postId) {
              const fileName = `${roomName}-${Date.now()}.webm`
              const { error } = await supabase.storage.from('videos').upload(fileName, blob, { upsert: true, contentType: 'video/webm' })
              if (!error) {
                const { data } = supabase.storage.from('videos').getPublicUrl(fileName)
                finalVideoUrl = data.publicUrl
                await supabase.from('posts').update({
                  media_url: finalVideoUrl, video_url: finalVideoUrl, tag: 'live_ended',
                  body: `Was Live from ${zipCode} - ${new Date().toLocaleString()}`, media_urls: [finalVideoUrl]
                }).eq('id', postId)
                resolve(finalVideoUrl)
                return
              }
            }
            if (postId) await supabase.from('posts').update({ tag: 'live_ended', body: `Was Live from ${zipCode}` }).eq('id', postId)
          } catch(e){ console.error(e) }
          resolve('')
        }
        recorder.stop()
      })
    }

    // 2. Close LiveKit room on server
    try {
      await fetch('/api/livekit/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, roomName }) })
    } catch {}

    // 3. NOW disconnect UI and notify parent
    onLiveEnded(postId, finalVideoUrl)
    setOpen(false)
    setToken('')
    setRoomName('')
    setPostId('')
    mediaRecorderRef.current = null
    chunksRef.current = []
    setIsEnding(false)
  }

  if (!open) {
    return <button onClick={startLive} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs">Go Live</button>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold">🔴 Live - {zipCode}</span>
          <button onClick={endLive} disabled={isEnding} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50">
            {isEnding? 'Saving...' : 'End Live - Save Replay'}
          </button>
        </div>
        {token && (
          <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect audio video>
            <MyVideoAndRecorder onReady={handleRecorderReady} />
          </LiveKitRoom>
        )}
        <div className="text-xs text-white/60 mt-3">Live in {zipCode} — video will be saved for replay.</div>
      </div>
    </div>
  )
}
