'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = { userId?: string, zipCode?: string, city?: string }

export default function GoLive({ userId, zipCode, city }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream|null>(null)

  const supabase = createClient()
  const cleanCity = (city || 'your area').replace(/, CA, CA/, ', CA')
  const zip = zipCode || 'GLOBAL'

  const openPreview = () => { setIsOpen(true); setIsLive(false) }

  const startLive = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = s
      if (videoRef.current) videoRef.current.srcObject = s

      // RECORD
      const recorder = new MediaRecorder(s, { mimeType: 'video/webm' })
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size>0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        await uploadLive(blob)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsLive(true)
    } catch { alert('Need camera/mic permission') }
  }

  const uploadLive = async (blob: Blob) => {
    setIsUploading(true)
    try {
      const filename = `live_${userId||'anon'}_${Date.now()}.webm`
      // 1. Upload to storage (bucket 'lives' or 'posts' - change if yours different)
      const { error: upErr } = await supabase.storage.from('lives').upload(filename, blob, { contentType: 'video/webm' })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('lives').getPublicUrl(filename)

      // 2. Create post in feed - uses profile zip variable - global - no hard code
      await supabase.from('posts').insert({
        user_id: userId,
        zip_code: zip,
        city: cleanCity,
        video_url: publicUrl,
        type: 'live',
        created_at: new Date().toISOString()
      })
      // success
      close()
      window.location.reload() // show in feed
    } catch (e) {
      console.error(e)
      alert('Upload failed - check storage bucket lives exists')
      setIsUploading(false)
    }
  }

  const endLive = () => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t=>t.stop())
    // upload happens in onstop
  }

  const close = () => {
    if (isLive) { endLive(); return }
    streamRef.current?.getTracks().forEach(t=>t.stop())
    setIsOpen(false); setIsLive(false); setIsUploading(false)
  }

  return (
    <>
      <button onClick={openPreview} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Go Live</button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/80 p-4">
          <div className="bg-zinc-900 rounded-xl w- max-w- overflow-hidden">
            <div className="flex justify-between p-3 border-b border-zinc-800">
              <span className="text-white font-bold">{isUploading? 'Uploading...' : isLive? '● LIVE' : 'Preview'}</span>
              <button onClick={close} className="w-6 h-6 rounded-full bg-white text-black text-xs">X</button>
            </div>
            <div className="flex justify-center bg-black py-4">
              <div className="w- h- rounded-lg overflow-hidden bg-zinc-950 relative flex items-center justify-center">
                {!isLive &&!isUploading && <div className="text-white/60 text-xs">Camera off - hit Start</div>}
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isLive?'hidden':''}`} />
                {isUploading && <div className="text-white text-xs animate-pulse">Uploading live...</div>}
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text- px-1 rounded">{cleanCity}</div>
              </div>
            </div>
            <div className="p-3 flex gap-2">
              {!isLive? (
                <button onClick={startLive} className="flex-1 bg-red-600 text-white py-2 rounded-full font-bold">Start Live</button>
              ) : (
                <button onClick={endLive} disabled={isUploading} className="flex-1 bg-zinc-700 text-white py-2 rounded-full font-bold">{isUploading?'Uploading...':'End Live & Post'}</button>
              )}
              <button onClick={close} disabled={isUploading} className="px-4 bg-zinc-800 text-white py-2 rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
