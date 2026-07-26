'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLiveButton() {
  const [recording, setRecording] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startLive() {
    try {
      // GLOBAL - any camera, any device
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream

      // THIS IS THE BOX YOU WERE MISSING - show what camera sees
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const name = `live-${user.id}-${Date.now()}.webm`
        const { error } = await supabase.storage.from('media').upload(name, blob, { contentType: 'video/webm', upsert: true })
        const url = error
         ? supabase.storage.from('posts').getPublicUrl(name).data.publicUrl
          : supabase.storage.from('media').getPublicUrl(name).data.publicUrl

        // If media upload failed, try posts bucket
        if (error) {
          await supabase.storage.from('posts').upload(name, blob, { contentType: 'video/webm', upsert: true })
        }

        await supabase.from('posts').insert({
          body: '🔴 LIVE from the block',
          content: '🔴 LIVE from the block',
          media_urls: [url],
          post_type: 'general',
          tag: 'live',
          city: 'San Jose',
          zip_code: '95122',
          user_id: user.id,
          author_id: user.id
        })
        streamRef.current?.getTracks().forEach(t => t.stop())
        setRecording(false)
        alert('✅ LIVE posted to 95122!')
        window.location.reload()
      }
      recorder.start(100)
      setRecording(true)
    } catch (err: any) {
      alert(`No camera: ${err?.message}. Click lock icon by URL -> Camera Allow -> Reload`)
    }
  }

  function stopLive() {
    recorderRef.current?.stop()
  }

  // NOT RECORDING - just show button
  if (!recording) {
    return (
      <button onClick={startLive} className="bg-red-600 text-white font-black px-5 py-2 rounded-full text-sm">
        GO LIVE
      </button>
    )
  }

  // RECORDING - show the video box you asked for
  return (
    <div className="fixed bottom-5 right-5 z-[9999] bg-black rounded-2xl p-2 shadow-2xl border-2 border-red-600 w-">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h- rounded-xl object-cover bg-black"
      />
      <div className="flex justify-between items-center mt-2 px-2">
        <span className="text-red-500 text-xs font-bold animate-pulse">● REC - You are LIVE</span>
        <button onClick={stopLive} className="bg-white text-black font-black px-4 py-1.5 rounded-full text-xs">
          STOP & POST
        </button>
      </div>
    </div>
  )
}
