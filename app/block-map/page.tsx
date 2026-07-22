'use client'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMapPage(){
  const { zip } = useLocation()
  const z = zip || '95122'

  // OSM tiles around 95122 at zoom 13
  const tiles = [
    ['1307','3159','1308','3159','1309','3159'],
    ['1307','3160','1308','3160','1309','3160'],
    ['1307','3161','1308','3161','1309','3161'],
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-white font-black text-2xl">BLOCK MAP • {z} • LIVE • 3 PINS</h1>
            <Link href="/feed" className="bg-white text-black font-black px-6 py-2 rounded-full hover:bg-yellow-400 transition">← Back to Feed</Link>
          </div>

          <div className="w-full h- rounded-2xl border-4 border-white/20 overflow-hidden bg-[#e5e3df] relative">
            {/* Tile grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {tiles.flat().map((x, i) => {
                const col = i % 3
                const row = Math.floor(i / 3)
                const tileX = 1307 + col
                const tileY = 3159 + row
                return (
                  <img
                    key={i}
                    src={`https://tile.openstreetmap.org/13/${tileX}/${tileY}.png`}
                    alt="map tile"
                    className="w-full h-full object-cover"
                  />
                )
              })}
            </div>

            {/* Pins */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl animate-pulse">📍 Story & King</div>
            </div>
            <div className="absolute top-[45%] left-[55%]">
              <div className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">🌮 Tacos El Jefe</div>
            </div>
            <div className="absolute top-[60%] left-[40%]">
              <div className="bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">🏷️ Yard Sale - King Rd</div>
            </div>

            <div className="absolute bottom-2 right-2 bg-black/70 text-white text- px-2 py-1 rounded">© OpenStreetMap • 95122</div>
          </div>

          <div className="text-center text-white/50 text-xs mt-3">Full Bloom Map • No iframe • Golden backdrop stays on /feed • Works everywhere</div>
        </div>
      </div>
    </>
  )
}
