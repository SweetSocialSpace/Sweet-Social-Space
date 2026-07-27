'use client'
import { useLocation } from '@/lib/location-context'

export function LocationScopeBar({ radius, setRadius }: { radius: number, setRadius: (n:number)=>void }){
  const { zip, city, loading, useMyLocation } = useLocation()
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-bold">NEAR: {zip || '...'}</span>
        <select value={radius} onChange={(e)=>{ try { setRadius(Number(e.target.value)) } catch {} }} className="bg-white text-black text-xs font-bold rounded-full px-3 py-1">
          <option value={5}>5 mi</option><option value={10}>10 mi</option><option value={25}>25 mi</option>
        </select>
      </div>
      <button onClick={()=>{ try { useMyLocation() } catch {} }} className="bg-white text-black text-xs font-black rounded-full px-4 py-1.5">
        {loading ? 'Locating...' : zip ? `${zip} • ${city}` : 'Use my location'}
      </button>
    </div>
  )
}
export default LocationScopeBar
