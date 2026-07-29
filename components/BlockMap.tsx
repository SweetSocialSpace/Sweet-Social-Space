'use client'
import Link from 'next/link'

export default function BlockMap(){
  return (
    <Link href="/block-map" className="block bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 hover:bg-black/80 transition group">
      <div className="flex justify-between items-center">
        <div className="text-white font-black text-xs tracking-wider">Block Map</div>
        <div className="bg-white text-black font-black px-3 py-1 rounded-full group-hover:bg-yellow-400 transition text-xs">View Map ↗</div>
      </div>
      <div className="text-white/40 text-xs mt-1">3 live pins • Full view</div>
    </Link>
  )
}
