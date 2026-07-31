'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId?: string
  zipCode?: string
  city?: string
  onLivePosted?: (p: any) => void
}

export default function GoLive({ userId, zipCode, city, onLivePosted }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const supabase = createClient()
  const cleanCity = (city || 'your area').replace(/, CA, CA/, ', CA')
  const zip = zipCode || 'GLOBAL'

  const openPreview = () => setIsOpen(true)

  const closeAll = () => {
    if (isSaving) return
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setIsOpen(false)
    setIsLive(false)
  }

  const startLive = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = s
      if (videoRef.current) videoRef.current.srcObject = s
      const rec = new MediaRecorder(s, { mimeType: 'video/webm' })
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = async () => {
        setIsSaving(true)
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        let url: string | null = null
        for (const b of ['posts', 'media', 'videos', 'uploads']) {
          try {
            const name = `live_${Date.now()}.webm`
            const { error } = await supabase.storage.from(b).upload(name, blob)
            if (!error) {
              url = supabase.storage.from(b).getPublicUrl(name).data.publicUrl
              break
            }
          } catch {}
        }
        const { data } = await supabase
         .from('posts')
         .insert({
            user_id: userId,
            zip_code: zip,
            city: cleanCity,
            video_url: url,
            content: `Live from ${cleanCity}`,
            type: 'live',
          })
         .select()
         .single()
        setIsSaving(false)
        setIsOpen(false)
        setIsLive(false)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        if (data && onLivePosted) onLivePosted(data)
      }
      rec.start()
      recRef.current = rec
      setIsLive(true)
    } catch {
      alert('Need camera/mic permission')
    }
  }

  const endLive = () => {
    recRef.current?.stop()
  }

  return (
    <>
      <button onClick={openPreview} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
        Go Live
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 rounded-2xl w- max-w- overflow-hidden border border-white/10">
            <div className="flex justify-between p-3 border-b border-zinc-800">
              <span className="text-white text-sm font-bold">{isSaving? 'Posting...' : isLive? '● LIVE' : 'Ready?'}</span>
              <button onClick={closeAll} className="w-6 h-6 rounded-full bg-zinc-800 text-white text-xs">X</button>
            </div>
            <div className="flex justify-center bg-black py-5">
              <div className="w- h- rounded-xl bg-zinc-950 overflow-hidden relative flex items-center justify-center">
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isLive? 'hidden' : ''}`} />
                {!isLive && <div className="text-white/40 text-xs text-center px-2">{cleanCity}</div>}
                {isSaving && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white text-xs">Posting to {zip}...</div>}
              </div>
            </div>
            <div className="p-3">
              {!isLive? (
                <button onClick={startLive} className="w-full bg-red-600 text-white py-2.5 rounded-full font-bold">Start Live</button>
              ) : (
                <button onClick={endLive} disabled={isSaving} className="w-full bg-white text-black py-2.5 rounded-full font-bold disabled:opacity-50">
                  {isSaving? 'Posting...' : 'End & Post'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
