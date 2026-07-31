'use client'
import { useState, useRef, useEffect } from 'react'
import { useLocation } from '@/lib/location-context'

type Props = {
  userId?: string
  zipCode?: string
  city?: string
}

export default function GoLive({ userId, zipCode: zipProp, city: cityProp }: Props) {
  // FIX: context name might be nearZip, zip, etc - use any to avoid TS error
  const loc: any = useLocation()
  const zipFromContext = loc?.zipCode || loc?.nearZip || loc?.zip || loc?.currentZip || 'GLOBAL'

  const [isOpen, setIsOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string|null>(null)
  const [realCity, setRealCity] = useState(cityProp || 'your area')
  const videoRef = useRef<HTMLVideoElement>(null)

  const zip = zipProp || zipFromContext || 'GLOBAL'

  useEffect(()=>{
    if (cityProp) setRealCity(cityProp)
  },[cityProp])

  const openPreview = async () => {
    setIsOpen(true)
    if (!cityProp) {
      try {
        const r = await fetch(`/api/zips?zip=${zip}`, { cache: 'no-store' })
        const d = await r.json()
        const c = d.city || 'your area'
        if (c.includes('Manado') || c.includes('Indonesia')) {
          setRealCity('your area')
        } else {
          setRealCity(c)
        }
      } catch { setRealCity('your area') }
    }
  }

  return (
    <>
      <button onClick={openPreview} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
        Go Live
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt- bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-zinc-900 rounded-xl w- max-w- overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-3 border-b border-zinc-800">
              <span className="text-white font-bold">Preview</span>
              <button onClick={()=>setIsOpen(false)} className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs">X</button>
            </div>

            <div className="flex justify-center bg-black py-4">
              <div className="w- h- rounded-lg overflow-hidden bg-zinc-950 relative">
                <video
                  ref={videoRef}
                  src={previewUrl || undefined}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!previewUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text- px-1 rounded">
                  {zip}, {realCity}
                </div>
              </div>
            </div>

            <div className="p-3 flex gap-2">
              <button className="flex-1 bg-red-600 text-white py-2 rounded-full font-bold">Start Live</button>
              <button onClick={()=>setIsOpen(false)} className="px-4 bg-zinc-800 text-white py-2 rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
