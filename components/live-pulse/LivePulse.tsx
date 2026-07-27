'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function LivePulse() {
  let zip = ''
  try{ zip = useLocation()?.zip || '' }catch{ zip = '' }
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!zip) return
    const load = async () => {
      try{
        const p = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const e = await fetch(`/api/emergency?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        setData({ pulse: p, weather: w, emergency: e })
      }catch{ /* house stays live even if APIs fail */ }
    }
    load()
    const i = setInterval(load, 60000)
    return () => clearInterval(i)
  }, [zip])

  const cityName = data?.weather?.city || data?.weather?.name || data?.pulse?.city || ''
  const tempRaw = data?.weather?.temp?? data?.weather?.main?.temp?? null
  let temp = tempRaw
  if (temp!== null && temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
  const online = data?.pulse?.online?? 1
  const title = cityName && zip && cityName.toLowerCase()!== zip.toLowerCase()? `${cityName.toUpperCase()} • ${zip}` : (zip || 'YOUR BLOCK')
  const weatherDesc = data?.weather?.description || data?.weather?.weather?.[0]?.main || ''

  return (
    <div className="space-y-3">
      <div className="bg-black/40 rounded-xl p-3 border border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-purple-300 text- font-black tracking-widest">LIVE • {title}</div>
            <div className="text-white text-sm mt-1">{temp!== null? `${Math.round(temp)}° ${weatherDesc}` : 'Loading weather...'} • {online} online</div>
            <div className="text-white/60 text-xs mt-1">{data?.emergency?.alert? `⚠ ${data.emergency.alert}` : `✓ No emergencies in ${zip || 'your area'}`}</div>
          </div>
          {/* GoLive removed - independent rib, does not share folder */}
          <div className="ml-3 text-white/20 text-xs font-black">LIVE</div>
        </div>
      </div>
    </div>
  )
}
