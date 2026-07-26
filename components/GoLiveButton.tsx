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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      let mime = 'video/webm'
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(mime)) mime = 'video/mp4'
      const recorder = new MediaRecorder(stream, { mimeType: mime })
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime })
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const ext = mime.includes('mp4') ? 'mp4' : 'webm'
        const name = `live-${user.id}-${Date.now()}.${ext}`
        await supabase.storage.from('media').upload(name, blob, { contentType: mime, upsert: true })
        const url = supabase.storage.from('media').getPublicUrl(name).data.publicUrl
        await supabase.from('posts').insert({
          body: '🔴 LIVE from the block', content: '🔴 LIVE from the block',
          media_urls: [url], post_type: 'general', tag: 'live',
          city: 'San Jose', zip_code: '95122', user_id: user.id, author_id: user.id
        })
        streamRef.current?.getTracks().forEach(t => t.stop())
        setRecording(false)
        alert('✅ LIVE posted to 95122!')
        window.location.reload()
      }
      recorder.start(100)
      setRecording(true)
    } catch (err: any) {
      alert(`No camera: ${err?.message}`)
    }
  }

  function stopLive() { recorderRef.current?.stop() }

  if (!recording) {
    return <button onClick={startLive} className="bg-red-600 text-white font-black px-5 py-2 rounded-full text-sm">GO LIVE</button>
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, background: 'black', borderRadius: '16px', padding: '8px', border: '3px solid red', width: '320px' }}>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '420px', borderRadius: '12px', objectFit: 'cover', background: 'black' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '0 8px' }}>
        <span style={{ color: 'red', fontSize: '12px', fontWeight: 'bold' }}>● REC - You are LIVE</span>
        <button onClick={stopLive} style={{ background: 'white', color: 'black', fontWeight: 900, padding: '6px 16px', borderRadius: '999px', fontSize: '12px' }}>STOP & POST</button>
      </div>
    </div>
  )
}
