'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

export default function LivePulse() {
  const { zip, city } = useLocation()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') return
    const load = async () => {
      try{
        const p = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const e = await fetch(`/api/emergency?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        setData({ pulse: p, weather: w, emergency: e })
      }catch{}
    }
    load()
    const i = setInterval(load, 60000)
    return () => clearInterval(i)
  }, [zip])

  const displayCity = city || data?.weather?.city || data?.weather?.name || data?.pulse?.city || 'your area'
  const tempRaw = data?.weather?.temp?? data?.weather?.main?.temp?? null
  let temp = tempRaw
  if (temp!== null && temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
  const online = data?.pulse?.online?? 2
  const weatherDesc = data?.weather?.description || data?.weather?.weather?.[0]?.main || 'clear sky'

  return (
    <div className="bg-black/40 rounded-xl p-3 border border-white/10">
      <div className="flex justify-between items-center">
        <span className="text-purple-300 font-black text-sm tracking-widest">{displayCity}</span>
        <span className="text- bg-white/10 text-white/60 px-2 py-0.5 rounded-full">LIVE</span>
      </div>
      <div className="text-white text-sm mt-1">
        {temp!== null? `${Math.round(temp)}° ${weatherDesc}` : 'Loading...'} • {online} online
      </div>
      <div className="text-white/60 text-xs mt-1">
        {data?.emergency?.alert? `⚠ ${data.emergency.alert}` : `✓ No emergencies`}
      </div>
    </div>
  )
}
