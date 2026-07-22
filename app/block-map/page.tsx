'use client'
import Header from '@/app/components/Header'
import { useLocation } from '@/lib/location-context'
import Link from 'next/link'

export default function BlockMapPage(){
  const { zip } = useLocation()
  const z = zip || '95122'
  return (
    <>
      <Header />
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-white font-black text-2xl">BLOCK MAP • {z} • LIVE</h1>
            <Link href="/feed" className="bg-white text-black font-black px-6 py-2 rounded-full">← Back to Feed</Link>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden border border-white/20 h-">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=-121.92,37.31,-121.84,37.35&layer=mapnik&marker=37.33,-121.88`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
          <div className="text-center text-white/50 text-xs mt-3">Your golden backdrop lives on feed • Full map lives here</div>
        </div>
      </div>
    </>
  )
}
