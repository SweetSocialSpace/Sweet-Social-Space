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
            <Link href="/feed" className="bg-white text-black font-black px-6 py-2 rounded-full hover:bg-yellow-400 transition">← Back to Feed</Link>
          </div>
          <div className="w-full h- rounded-2xl border-4 border-white/20 overflow-hidden bg-white">
            <iframe
              width="100%"
              height="100%"
              style={{border:0}}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${z},San+Jose,CA&z=13&output=embed`}
            />
          </div>
          <div className="text-center text-white/50 text-xs mt-3">Full Bloom Map • Golden backdrop stays on /feed</div>
        </div>
      </div>
    </>
  )
}
