'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveKitRoom, VideoTrack, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'

/**
 * This little component shows your camera.
 * If camera not ready, it shows "Starting camera..."
 */
function MyVideo() {
  const tracks = useTracks([Track.Source.Camera])
  const trackRef = tracks[0]

  if (!trackRef) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white">
        Starting camera...
      </div>
    )
  }

  return (
    <VideoTrack
      trackRef={trackRef}
      className="w-full aspect-video rounded-xl bg-black object-cover"
    />
  )
}

/**
 * MAIN LIVE COMPONENT
 * Harry, think of this like:
 * - Press button → start live
 * - When ending → record stops, video uploads, post updates
 */
export default function GoLive({
  userId,
  zipCode,
  city,
  onLivePosted,
  onLiveEnded
}: {
  userId?: string
  zipCode: string
  city: string
  onLivePosted: (p: any) => void
  onLiveEnded: (id: string, videoUrl?: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState('')
  const [roomName, setRoomName] = useState('')
  const [postId, setPostId] = useState<string>('')
  const [isEnding, setIsEnding] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('')

  const supabase = createClient()

  /**
   * START LIVE
   * 1. Create room
   * 2. Create post
   * 3. Start recording camera
   */
  const startLive = async () => {
    setIsEnding(false)

    const cleanZip = zipCode || 'GLOBAL'
    const rName = `live-${Date.now()}`
    setRoomName(rName)

    // Get LiveKit token
    const res = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: rName,
        participantName: userId || 'host',
        role: 'host'
      })
    })

    const data = await res.json()
    setToken(data.token)

    // Create post in Supabase
    const bodyText = `LIVE NOW from ${cleanZip} - ${new Date().toLocaleString()}`

    const { data: post } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        body: bodyText,
        tag: 'live',
        zip_code: cleanZip,
        livekit_room: rName
      })
      .select()
      .single()

    if (post) {
      setPostId(post.id)
      onLivePosted(post)
    }

    setOpen(true)

    // Start recording camera
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm'
        })

        chunksRef.current = []

        recorder.ondataavailable = e => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        recorder.start(1000)
        mediaRecorderRef.current = recorder
      } catch {
        console.log('Camera failed to start')
      }
    }, 1000)
  }

  /**
   * END LIVE
   * 1. Stop recorder
   * 2. Upload video
   * 3. Update post
   * 4. Call onLiveEnded
   */
  const endLive = async () => {
    if (isEnding) return
    setIsEnding(true)

    const recorder = mediaRecorderRef.current

    // If recorder is running, stop it and upload video
    if (recorder && recorder.state !== 'inactive') {
      await new Promise<void>(resolve => {
        recorder.onstop = async () => {
          try {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' })

            if (blob.size > 1000 && postId) {
              const fileName = `${roomName}-${Date.now()}.webm`

              const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(fileName, blob, {
                  upsert: true,
                  contentType: 'video/webm'
                })

              if (!uploadError) {
                const { data: urlData } = supabase.storage
                  .from('videos')
                  .getPublicUrl(fileName)

                const videoUrl = urlData.publicUrl
                setUploadedVideoUrl(videoUrl)

                const wasBody = `Was Live from ${zipCode} - ${new Date().toLocaleString()}`

                await supabase
                  .from('posts')
                  .update({
                    media_url: videoUrl,
                    video_url: videoUrl,
                    tag: 'live_ended',
                    body: wasBody,
                    media_urls: [videoUrl]
                  })
                  .eq('id', postId)
              } else {
                const wasBody = `Was Live from ${zipCode} - ${new Date().toLocaleString()}`
                await supabase
                  .from('posts')
                  .update({ tag: 'live_ended', body: wasBody })
                  .eq('id', postId)
              }
            } else if (postId) {
              const wasBody = `Was Live from ${zipCode} - ${new Date().toLocaleString()}`
              await supabase
                .from('posts')
                .update({ tag: 'live_ended', body: wasBody })
                .eq('id', postId)
            }
          } catch (err) {
            console.error('Error stopping recorder:', err)
          }

          resolve()
        }

        recorder.stop()
        recorder.stream.getTracks().forEach(t => t.stop())
      })
    }

    // Tell backend to close LiveKit room
    try {
      await fetch('/api/livekit/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, roomName })
      })
    } catch {
      if (postId) onLiveEnded(postId, uploadedVideoUrl)
    }

    // Always call onLiveEnded with the uploaded video URL
    if (postId) onLiveEnded(postId, uploadedVideoUrl)

    // Reset everything
    setUploadedVideoUrl('')
    setOpen(false)
    setToken('')
    setRoomName('')
    setPostId('')
    chunksRef.current = []
    setIsEnding(false)
  }

  /**
   * UI
   */
  if (!open) {
    return (
      <button
        onClick={startLive}
        className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs"
      >
        Go Live
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold">🔴 Live - {zipCode}</span>

          <button
            onClick={endLive}
            disabled={isEnding}
            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50"
          >
            End Live - Save Replay
          </button>
        </div>

        {token && (
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect
            audio
            video
          >
            <MyVideo />
          </LiveKitRoom>
        )}

        <div className="text-xs text-white/60 mt-3">
          Live in {zipCode} — worldwide — video will be saved for replay.
        </div>
      </div>
    </div>
  )
}
