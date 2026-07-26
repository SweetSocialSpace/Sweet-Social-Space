'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GoLiveButton() {
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  async function startGoLive() {
    try {
      // GLOBAL: any camera, any phone, any computer
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { alert('Not logged in'); return }
        const filename = `live-${user.id}-${Date.now()}.webm`
        let publicUrl = ''
        const { error } = await supabase.storage.from('media').upload(filename, blob, { contentType: 'video/webm', upsert: true })
        if (error) {
          await supabase.storage.from('posts').upload(filename, blob, { contentType: 'video/webm', upsert: true })
          publicUrl = supabase.storage.from('posts').getPublicUrl(filename).data.publicUrl
        } else {
          publicUrl = supabase.storage.from('media').getPublicUrl(filename).data.publicUrl
        }
        await supabase.from('posts').insert({
          body: '🔴 LIVE from the block', content: '🔴 LIVE from the block',
          media_urls: [publicUrl], post_type: 'general', tag: 'live',
          city: 'San Jose', zip_code: '95122', user_id: user.id, author_id: user.id
        })
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        alert('✅ LIVE posted!')
        window.location.reload()
      }
      recorder.start(100)
      setRecording(true)
    } catch (err: any) {
      let msg = 'Camera blocked. Click lock icon in address bar -> Allow camera/mic -> Reload.'
      if(err?.name === 'NotFoundError') msg = 'No camera on this device.'
      alert(msg)
    }
  }

  function stopGoLive() { mediaRecorderRef.current?.stop(); setRecording(false) }

  return (
    <div className="flex flex-col items-center gap-1">
      {!recording? (
        <button onClick={startGoLive} className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2 rounded-full flex items-center gap-2 text-sm shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>GO LIVE
        </button>
      ) : (
        <>
          <video ref={videoPreviewRef} autoPlay muted playsInline className="w-48 rounded-lg bg-black aspect-[9/16] object-cover" />
          <button onClick={stopGoLive} className="bg-black text-white font-black px-4 py-2 rounded-full text-xs">■ STOP & POST</button>
          <p className="text-red-500 animate-pulse text-xs">● RECORDING</p>
        </>
      )}
    </div>
  )
}
