'use client'
import { useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function BlockMap(){
  const [open, setOpen] = useState(false)
  const { zip } = useLocation()
  const z = zip || '95122'

  return (
    <>
      {/* COMPACT TAB - always visible */}
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-white font-black text-xs">BLOCK MAP • {z} • 3 LIVE PINS</div>
          <button onClick={()=>setOpen(true)} className="text- bg-white text-black font-black px-3 py-1 rounded-full">Open Map ↗</button>
        </div>
        <div onClick={()=>setOpen(true)} className="relative h- rounded-xl overflow-hidden cursor-pointer border border-white/10 group">
          <img
            src={`https://tile.openstreetmap.org/13/1308/3160.png`}
            alt="map preview"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <span className="text-white text-xs font-bold">San Jose {z} • 3 pins</span>
            <span className="text-white/60 text-">Tap to expand</span>
          </div>
        </div>
      </div>

      {/* FULL BLOOM MAP - modal */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl p-4">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-black text-xl">FULL BLOCK MAP • {z} • 3 LIVE PINS</h2>
              <button onClick={()=>setOpen(false)} className="bg-white text-black font-black px-6 py-2 rounded-full">✕ Close</button>
            </div>
            <div className="flex-1 bg-white rounded-2xl overflow-hidden border-4 border-white/20">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=-121.92,37.31,-121.84,37.35&layer=mapnik&marker=37.33,-121.88`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
            <div className="mt-3 text-center text-white/60 text-xs">Golden backdrop stays • Map in modal • No duplicate</div>
          </div>
        </div>
      )}
    </>
  )
}
