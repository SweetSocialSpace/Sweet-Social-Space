'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = { userId?: string, zipCode?: string, city?: string, onLivePosted?: (post:any)=>void }

export default function GoLive({ userId, zipCode, city, onLivePosted }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream|null>(null)
  const supabase = createClient()
  const cleanCity = (city || 'your area').replace(/, CA, CA/, ', CA')
  const zip = zipCode || '95122'

  const open = () => setIsOpen(true)

  const startLive = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
    streamRef.current = s
    if (videoRef.current) videoRef.current.srcObject = s
    const rec = new MediaRecorder(s, { mimeType: 'video/webm' })
    chunksRef.current = []
    rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data) }
    rec.onstop = async () => {
      setIsSaving(true)
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      let url = null
      // try existing buckets only - no alert, no popup
      for (const b of ['posts','media','videos','uploads']) {
        try {
          const name = `live_${userId}_${Date.now()}.webm`
          const { error } = await supabase.storage.from(b).upload(name, blob)
          if (!error) { url = supabase.storage.from(b).getPublicUrl(name).data.publicUrl; break }
        } catch {}
      }
      const { data } = await supabase.from('posts').insert({
        user_id: userId, zip_code: zip, city: cleanCity, video_url: url, content: `Live from ${cleanCity}`, type: 'live'
      }).select().single()

      // SMOOTH - no reload - just close + push to feed via callback
      setIsSaving(false)
      setIsOpen(false); setIsLive(false)
      streamRef.current?.getTracks().forEach(t=>t.stop())
      if (data && onLivePosted) onLivePosted(data)
      else if (data) {
        // soft insert without reload - dispatch event feed listens to
        window.dispatchEvent(new CustomEvent('new-live-post', { detail: data }))
      }
    }
    rec.start()
    mediaRecorderRef.current = rec
    setIsLive(true)
  }

  const endLive = () => { mediaRecorderRef.current?.stop() }
  const close = () => {
    if (isSaving) return
    streamRef.current?.getTracks().forEach(t=>t.stop())
    setIsOpen(false); setIsLive(false)
  }

  return (
    <>
      <button onClick={open} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Go Live</button>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt- bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-2xl w- max-w- overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between p-3 border-b border-zinc-800">
              <span className="text-white font-bold text-sm">{isSaving?'Saving...': isLive?'● LIVE • '+cleanCity : 'Ready to go live?'}</span>
              <button onClick={close} disabled={isSaving} className="w-6 h-6 rounded-full bg-zinc-800 text-white text-xs">X</button>
            </div>
            <div className="flex justify-center bg-black py-5">
              <div className="w- h- rounded-xl overflow-hidden bg-zinc-950 relative">
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isLive?'hidden':''}`} />
                {!isLive && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"><div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">▶</div><span className="text-white/50 text-">{cleanCity}</span></div>}
                {isSaving && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><span className="text-white text-xs animate-pulse">Posting to {zip}...</span></div>}
              </div>
            <div className="p-3">
              {!isLive? <button onClick={startLive} className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full font-bold transition">Start Live</button>
              : <button onClick={endLive} disabled={isSaving} className="w-full bg-white text-black py-2.5 rounded-full font-bold transition disabled:opacity-50">{isSaving?'Posting...':'End & Post Smooth'}</button>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
