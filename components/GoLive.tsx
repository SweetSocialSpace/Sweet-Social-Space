'use client'
import { useState, useRef, useEffect } from 'react'
type Props = { userId?: string, zipCode?: string, city?: string }
export default function GoLive({ zipCode: zipProp, city: cityProp }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [city, setCity] = useState(cityProp || 'your area')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream|null>(null)
  const zip = zipProp || 'GLOBAL'

  useEffect(()=>{ if (cityProp) setCity(cityProp) },[cityProp])

  const open = async () => {
    setIsOpen(true)
    if (!cityProp) {
      try { const d = await fetch(`/api/zips?zip=${zip}`, {cache:'no-store'}).then(r=>r.json()); setCity(d.city||'your area') } catch { setCity('your area') }
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 160, height: 220 }, audio: true })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream }
    } catch {}
  }
  const close = () => {
    streamRef.current?.getTracks().forEach(t=>t.stop())
    setIsOpen(false)
  }

  return (
    <>
      <button onClick={open} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Go Live</button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/80 p-4">
          <div className="bg-zinc-900 rounded-xl w- max-w- overflow-hidden">
            <div className="flex justify-between p-3 border-b border-zinc-800"><span className="text-white font-bold">Preview</span><button onClick={close} className="w-6 h-6 rounded-full bg-white text-black text-xs">X</button></div>
            <div className="flex justify-center bg-black py-4">
              {/* NO duplicate zip - only city variable */}
              <div className="w- h- rounded-lg overflow-hidden bg-zinc-950 relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text- px-1 rounded">{city}</div>
              </div>
            </div>
            <div className="p-3 flex gap-2"><button className="flex-1 bg-red-600 text-white py-2 rounded-full font-bold">Start Live</button><button onClick={close} className="px-4 bg-zinc-800 text-white py-2 rounded-full">Cancel</button></div>
          </div>
        </div>
      )}
    </>
  )
}
