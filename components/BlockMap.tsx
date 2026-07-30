'use client'
import Link from 'next/link'
export default function LiveMap(){
  return (
    <Link href="/live-map" className="block bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs">Live Map</div>
      <div className="text-white/40 text-xs mt-1">3 live pins • Full view</div>
    </Link>
  )
}
