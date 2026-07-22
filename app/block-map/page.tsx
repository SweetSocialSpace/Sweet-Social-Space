'use client'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMapPage(){
  const { zip } = useLocation()
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-white font-black text-2xl">BLOCK MAP • {zip || '95122'} • LIVE • 3 PINS</h1>
            <Link href="/feed" className="bg-white text-black font-black px-6 py-2 rounded-full">← Back to Feed</Link>
          </div>

          <div className="w-full h- rounded-2xl border-4 border-white/20 overflow-hidden bg-[#ddd] relative">
            {/* 3x3 tile grid - this URL works, you saw it work */}
            <div className="absolute inset-0 grid grid-cols-3">
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

            {/* Pins overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">📍 Story & King</div>
            <div className="absolute top-[40%] left-[60%] bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">🌮 Tacos El Jefe</div>
            <div className="absolute top-[60%] left-[35%] bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">🏷️ King Rd Sale</div>

            <div className="absolute bottom-2 right-2 bg-black/70 text-white text- px-2 py-1 rounded">© OpenStreetMap</div>
          </div>

          <div className="text-center text-white/50 text-xs mt-3">Full Bloom Map • OSM tiles - the one that actually loads</div>
        </div>
      </div>
    </>
  )
}
