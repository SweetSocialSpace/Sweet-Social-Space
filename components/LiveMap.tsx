'use client'
import { useLocation } from '@/lib/location-context'

export default function LiveMap() {
  const { city, zip } = useLocation()
  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs mb-2">Live Map • {city || zip || 'your area'}</div>
      <div className="text-white/40 text-xs">3 live pins • Full view</div>
      <button className="mt-2 bg-white text-black rounded-full px-3 py-1 text-xs font-bold">View Map</button>
    </div>
  )
}
