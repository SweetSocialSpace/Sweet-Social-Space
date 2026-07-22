'use client'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMapPage(){
  const { zip } = useLocation()
  return (
    <>
      <Header />
      {/* GOLDEN BACKDROP - same as feed, never deleted, in very back */}
      <div className="min-h-screen w-full bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-600" />
        </div>

        {/* MAP FLOATS OVER BACKDROP - opaque enough to read streets */}
        <div className="relative z-10 p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-white font-black text-2xl drop-shadow-xl">BLOCK MAP • {zip || '95122'} • LIVE</h1>
            <Link href="/feed" className="bg-white text-black font-black px-6 py-2 rounded-full hover:bg-yellow-400 transition shadow-xl">← Back to Feed</Link>
          </div>

          <div className="w-full h- bg-white rounded-2xl overflow-hidden border-4 border-white/30 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
            {/* OSM Tiles - the ones that actually load */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              <img src="https://tile.openstreetmap.org/13/1307/3159.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1308/3159.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1309/3159.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1307/3160.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1308/3160.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1309/3160.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1307/3161.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1308/3161.png" className="w-full h-full object-cover" alt="" />
              <img src="https://tile.openstreetmap.org/13/1309/3161.png" className="w-full h-full object-cover" alt="" />
            </div>
            {/* Pins */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl">📍 Story & King</div>
            <div className="absolute top-[40%] left-[60%] bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">🌮 Tacos El Jefe</div>
            <div className="absolute top-[65%] left-[38%] bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">🏷️ King Rd Sale</div>
          </div>

          <div className="text-center text-white/60 text-xs mt-4 tracking-wide">Golden backdrop in very back • Map opaque to read streets • Faith = kept</div>
        </div>
      </div>
    </>
  )
}
