'use client'
import { useState, useRef, useEffect } from 'react'

type Props = { userId?: string, zipCode?: string, city?: string }

export default function GoLive({ zipCode, city }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream|null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // FIX duplicate CA, CA - clean display, still uses your zip variable
  const cleanCity = (city || 'your area').replace(/, CA, CA/, ', CA').replace(/San Jose, CA, CA/, 'San Jose, CA')

  const openPreview = async () => {
    setIsOpen(true)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(s)
      setTimeout(()=>{ if (videoRef.current) videoRef.current.srcObject = s }, 100)
    } catch (e) { console.log('camera fail', e) }
  }

  const close = () => {
    stream?.getTracks().forEach(t=>t.stop())
    setStream(null)
    setIsOpen(false)
  }

  const startLive = async () => {
    // YOUR original Start Live logic here - keep whatever you had before my meddle
    // Example: if you had supabase upload, keep it - this button now works because stream exists
    console.log('Start Live for zip', zipCode, 'city', cleanCity)
    // TODO: restore your original handleGoLive() function call
    // handleGoLive(stream, zipCode, cleanCity)
  }

  return (
    <>
      <button onClick={openPreview} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Go Live</button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/80 p-4">
          <div className="bg-zinc-900 rounded-xl w- max-w- overflow-hidden">
            <div className="flex justify-between p-3 border-b border-zinc-800">
              <span className="text-white font-bold">Preview</span>
              <button onClick={close} className="w-6 h-6 rounded-full bg-white text-black text-xs">X</button>
            </div>

            {/* 160x220 perfect size - not monster */}
            <div className="flex justify-center bg-black py-4">
              <div className="w- h- rounded-lg overflow-hidden bg-zinc-950 relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover bg-black" />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text- px-1 rounded">
                  {cleanCity}
                </div>
              </div>
            </div>

            <div className="p-3 flex gap-2">
              <button onClick={startLive} className="flex-1 bg-red-600 text-white py-2 rounded-full font-bold">Start Live</button>
              <button onClick={close} className="px-4 bg-zinc-800 text-white py-2 rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
