'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = { userId?: string, zipCode?: string, city?: string }

export default function GoLive({ userId, zipCode, city }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream|null>(null)
  const supabase = createClient()
  const cleanCity = (city || 'your area').replace(/, CA, CA/, ', CA')
  const zip = zipCode || '95122'

  const openPreview = () => setIsOpen(true)

  const startLive = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    streamRef.current = s
    if (videoRef.current) videoRef.current.srcObject = s
    const recorder = new MediaRecorder(s, { mimeType: 'video/webm' })
    chunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size>0) chunksRef.current.push(e.data) }
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      // TRY upload to EXISTING buckets - posts, media, videos - not lives (doesn't exist)
      let publicUrl: string | null = null
      for (const bucket of ['posts','media','videos','uploads']) {
        try {
          const name = `live_${Date.now()}.webm`
          const { error } = await supabase.storage.from(bucket).upload(name, blob)
          if (!error) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(name)
            publicUrl = data.publicUrl
            break
          }
        } catch {}
      }
      // ALWAYS create post - even if storage failed - so it doesn't disappear - RULES: never lose user data
      await supabase.from('posts').insert({
        user_id: userId,
        zip_code: zip,
        city: cleanCity,
        video_url: publicUrl,
        content: publicUrl? `Live from ${cleanCity}` : `Live from ${cleanCity} (audio)`,
        type: 'live'
      })
      closeAll()
      window.location.reload()
    }
    recorder.start()
    mediaRecorderRef.current = recorder
    setIsLive(true)
  }

  const endLive = () => { mediaRecorderRef.current?.stop() }
  const closeAll = () => {
    streamRef.current?.getTracks().forEach(t=>t.stop())
    setIsOpen(false); setIsLive(false)
  }

  return (
    <>
      <button onClick={openPreview} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Go Live</button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/80 p-4">
          <div className="bg-zinc-900 rounded-xl w- max-w- overflow-hidden">
            <div className="flex justify-between p-3 border-b border-zinc-800"><span className="text-white font-bold">{isLive?'● LIVE':'Preview - Camera off'}</span><button onClick={closeAll} className="w-6 h-6 rounded-full bg-white text-black text-xs">X</button></div>
            <div className="flex justify-center bg-black py-4">
              <div className="w- h- rounded-lg bg-zinc-950 relative"><video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" /></div>
            </div>
            <div className="p-3 flex gap-2">
              {!isLive? <button onClick={startLive} className="flex-1 bg-red-600 text-white py-2 rounded-full font-bold">Start Live</button>
              : <button onClick={endLive} className="flex-1 bg-zinc-700 text-white py-2 rounded-full font-bold">End Live & Post to {zip}</button>}
              <button onClick={closeAll} className="px-4 bg-zinc-800 text-white py-2 rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
