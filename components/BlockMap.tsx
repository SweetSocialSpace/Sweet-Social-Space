'use client'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMap(){
  const { zip } = useLocation()
  const z = zip || '95122'
  return (
    <Link href="/block-map" className="block bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 hover:bg-white/10 transition group">
      <div className="flex justify-between items-center">
        <div className="text-white font-black text-xs">BLOCK MAP • {z}</div>
        <div className="text- bg-white text-black font-black px-3 py-1 rounded-full group-hover:bg-yellow-400 transition">VIEW MAP ↗</div>
      </div>
      <div className="text-white/50 text- mt-1">3 LIVE PINS • Click to open full map</div>
    </Link>
  )
}
