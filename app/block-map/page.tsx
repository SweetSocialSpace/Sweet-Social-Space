'use client'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMapPage(){
  const { zip } = useLocation()
  const z = zip || '95122'
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-white font-black text-2xl">BLOCK MAP • {z} • LIVE • 3 PINS</h1>
            <Link href="/feed" className="bg-white text-black font-black px-6 py-2 rounded-full">← Back to Feed</Link>
          </div>

          <div className="w-full h- rounded-2xl border-4 border-white/20 overflow-hidden bg-white relative">
            <img
              src="https://staticmap.openstreetmap.de/staticmap.php?center=37.3352,-121.8811&zoom=13&size=1200x800&markers=37.3352,-121.8811,red-pushpin%20%2037.32,-121.89,blue-pushpin%20%2037.34,-121.87,green-pushpin"
              alt="95122 map"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-xl text-xs font-bold">
              📍 Story & King - LIVE<br/>🌮 Tacos El Jefe<br/>🏷️ Yard Sale - King Rd
            </div>
          </div>

          <div className="text-center text-white/50 text-xs mt-3">Full Bloom Map • Single image • Golden backdrop stays on /feed</div>
        </div>
      </div>
    </>
  )
}
