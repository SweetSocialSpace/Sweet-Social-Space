'use client'
import { useLocation } from '@/lib/location-context'
export default function LiveBadge(){
  const { zip } = useLocation()
  const label = zip && zip !== 'LOCAL' ? zip : 'YOUR AREA'
  return <div className="text-white/60 text-xs font-black">{label} • LIVE</div>
}
