'use client'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMap(){
  const { zip } = useLocation()
  return (
    <Link href="/block-map" className="block bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 hover:bg-black/80 transition group">
      <div className="flex justify-between items-center">
        {/* GLOBAL FIX: No more 95122 fallback */}
        <div className="text-white font-black text-xs tracking-wider">BLOCK MAP • {zip || 'YOUR BLOCK'}</div>
        <div className="bg-white text-black font-black px-3 py-1 rounded-full group-hover:bg-yellow-400 transition text-xs">VIEW MAP ↗</div>
      </div>
      <div className="text-white/40 text-xs mt-1">3 LIVE PINS • Full view</div>
    </Link>
  )
}
