'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLiveButton() {
  const [recording, setRecording] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  async function startGoLive() {
    try {
      // This is the REAL camera - back camera for filming what YOU see
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: true
      })

      streamRef.current = stream
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)

        // Upload and post to 95122 feed
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          alert('Not logged in')
          return
        }

        const filename = `live-${user.id}-${Date.now()}.webm`
        const { error: uploadError } = await supabase.storage
         .from('media')
         .upload(filename, blob, { contentType: 'video/webm', upsert: true })

        if (uploadError) {
          // Try 'posts' bucket if 'media' doesn't exist
          await supabase.storage.from('posts').upload(filename, blob, { contentType: 'video/webm', upsert: true })
        }

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(filename)
        const publicUrl = urlData.publicUrl || supabase.storage.from('posts').getPublicUrl(filename).data.publicUrl

        await supabase.from('posts').insert({
          body: '🔴 LIVE from the block',
          content: '🔴 LIVE from 95122 - recording from the block',
          media_urls: [publicUrl],
          post_type: 'general',
          tag: 'live',
          city: 'San Jose',
          zip_code: '95122',
          user_id: user.id,
          author_id: user.id
        })

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
        }

        alert('✅ LIVE posted to 95122!')
        window.location.reload()
      }

      recorder.start(100)
      setRecording(true)

    } catch (err: any) {
      console.error(err)
      alert(`Camera failed: ${err.message}. On your phone, use Safari (iPhone) or Chrome (Android) and tap Allow when it asks for camera. On laptop, close other apps using camera.`)
    }
  }

  function stopGoLive() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    setPreviewUrl(null)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {!recording? (
        <button
          onClick={startGoLive}
          className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
        >
          <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
          GO LIVE
        </button>
      ) : (
        <>
          <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full max-w-sm rounded-xl bg-black aspect-[9/16] object-cover" />
          <button
            onClick={stopGoLive}
            className="bg-black text-white font-black px-6 py-3 rounded-full flex items-center gap-2"
          >
            ■ STOP & POST TO 95122
          </button>
          <p className="text-xs text-red-600 animate-pulse">● RECORDING - filming what you see</p>
        </>
      )}
    </div>
  )
}
