'use client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { useTranslations } from '@/lib/translations'

export function LocationScopeBar(){
  const { zip, city, loading } = useLocation()
  const { requestGeolocation, setScope, scope } = useLocationScope()
  const t = useTranslations() as any
  
  const radius = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[scope] || 10
  
  const handleRadiusChange = (r: number) => {
    setScope(`${r}mi` as any)
  }
  
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-bold">{t?.location?.near || 'NEAR'}: {zip || '...'}</span>
        <select value={radius} onChange={(e)=>{ try { handleRadiusChange(Number(e.target.value)) } catch {} }} className="bg-white text-black text-xs font-bold rounded-full px-3 py-1">
          <option value={5}>5 {t?.location?.mi || 'mi'}</option><option value={10}>10 {t?.location?.mi || 'mi'}</option><option value={15}>15 {t?.location?.mi || 'mi'}</option><option value={20}>20 {t?.location?.mi || 'mi'}</option>
        </select>
      </div>
      <button onClick={()=>{ try { requestGeolocation() } catch {} }} className="bg-white text-black text-xs font-black rounded-full px-4 py-1.5">
        {loading ? (t?.location?.locating || 'Locating...') : zip ? `${zip} • ${city}` : (t?.location?.setLocation || 'Set location')}
      </button>
    </div>
  )
}
export default LocationScopeBar
