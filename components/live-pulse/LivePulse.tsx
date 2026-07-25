'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function LivePulse() {
  const { zip } = useLocation()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!zip) return
    const load = async () => {
      const p = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
      const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
      const e = await fetch(`/api/emergency?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
      setData({ pulse: p, weather: w, emergency: e })
    }
    load()
    const i = setInterval(load, 60000)
    return () => clearInterval(i)
  }, [zip])

  // AUTOMATIC FIX: reads BOTH formats — your current {temp,city,description} AND raw OpenWeather {main.temp,name,weather[0].main}
  const cityName = data?.weather?.city || data?.weather?.name || data?.pulse?.city || ''
  const tempRaw = data?.weather?.temp ?? data?.weather?.main?.temp ?? null
  let temp = tempRaw
  if (temp!== null && temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
  const online = data?.pulse?.online ?? 1

  // GLOBAL FIX: don't double print zip
  const title = cityName && cityName.toLowerCase() !== zip.toLowerCase() ? `${cityName.toUpperCase()} • ${zip}` : zip

  const weatherDesc = data?.weather?.description || data?.weather?.weather?.[0]?.main || ''

  return (
    <div className="space-y-3">
      <div className="bg-black/40 rounded-xl p-3 border border-white/10">
        <div className="text-purple-300 text- font-black tracking-widest">LIVE • {title || 'YOUR BLOCK'}</div>
        <div className="text-white text-sm mt-1">{temp!== null? `${Math.round(temp)}° ${weatherDesc}` : 'Loading weather...'} • {online} online</div>
        <div className="text-white/60 text-xs mt-1">{data?.emergency?.alert? `⚠ ${data.emergency.alert}` : `✓ No emergencies in ${zip || 'your area'}`}</div>
      </div>
    </div>
  )
}
