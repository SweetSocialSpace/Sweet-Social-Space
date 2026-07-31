'use client'
import { useState, useRef } from 'react'

type Props = { userId?: string, zipCode?: string, city?: string }

export default function GoLive({ zipCode, city }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [stream, setStream] = useState<MediaStream|null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const cleanCity = (city || 'your area').replace(/, CA, CA/, ', CA')

  // OPEN = NO CAMERA - just preview placeholder
  const openPreview = () => {
    setIsOpen(true)
    setIsLive(false)
  }

  // START LIVE = NOW camera/mic on - privacy correct
  const startLive = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(s)
      setIsLive(true)
      setTimeout(()=>{ if (videoRef.current) videoRef.current.srcObject = s }, 100)
      // YOUR original go-live upload logic here - keep your supabase code
      console.log('LIVE START for zip', zipCode, cleanCity)
    } catch (e) {
      alert('Camera/mic permission needed to go live')
    }
  }

  const close = () => {
    stream?.getTracks().forEach(t=>t.stop())
    setStream(null)
    setIsLive(false)
    setIsOpen(false)
  }

  return (
    <>
      <button onClick={openPreview} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Go Live</button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/80 p-4">
          <div className="bg-zinc-900 rounded-xl w- max-w- overflow-hidden">
            <div className="flex justify-between p-3 border-b border-zinc-800">
              <span className="text-white font-bold">{isLive? 'LIVE' : 'Preview'}</span>
              <button onClick={close} className="w-6 h-6 rounded-full bg-white text-black text-xs">X</button>
            </div>

            <div className="flex justify-center bg-black py-4">
              <div className="w- h- rounded-lg overflow-hidden bg-zinc-950 relative flex items-center justify-center">
                {!isLive? (
                  // PREVIEW - NO CAMERA - placeholder
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 mx-auto flex items-center justify-center mb-2">
                      <span className="text-white text-lg">▶</span>
                    </div>
                    <span className="text-white/60 text-xs">Camera off</span>
                  </div>
                ) : (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text- px-1 rounded">{cleanCity}</div>
              </div>
            </div>

            <div className="p-3 flex gap-2">
              {!isLive? (
                <button onClick={startLive} className="flex-1 bg-red-600 text-white py-2 rounded-full font-bold">Start Live</button>
              ) : (
                <button onClick={close} className="flex-1 bg-zinc-700 text-white py-2 rounded-full font-bold">End Live</button>
              )}
              <button onClick={close} className="px-4 bg-zinc-800 text-white py-2 rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
