'use client'
import { useLocation } from '@/lib/location-context'
import { useEffect, useState } from 'react'

export default function SidebarLocationCard() {
  const { zip, city, country } = useLocation()
  const [weather, setWeather] = useState<any>(null)
  const [pulse, setPulse] = useState<any>(null)

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') return
    fetch(`/api/weather?zip=${zip}`).then(r=>r.json()).then(setWeather).catch(()=>{})
    fetch(`/api/pulse?zip=${zip}`).then(r=>r.json()).then(setPulse).catch(()=>{})
  }, [zip])

  const displayCity = (() => {
    if (!city) return zip
    return city
  })()

  const temp = weather?.temp? `${Math.round(weather.temp)}°` : ''
  const condition = weather?.condition || 'clear sky'
  const online = pulse?.online?? 2
  const emergencies = pulse?.emergencies?? 0

  return (
    <div className="bg-white/[0.06] backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-black text-white text-sm tracking-wide">{zip === 'GLOBAL'? 'GLOBAL' : `${zip}, ${displayCity}`}</p>
          <p className="text-xs text-white/70 mt-1">{temp} {condition} • {online} online</p>
          <p className="text- text-white/40 mt-1">{emergencies === 0? '✓ No emergencies' : `⚠ ${emergencies} alerts`}</p>
        </div>
        <span className={`text- font-black px-2 py-0.5 rounded-full ${zip!== 'GLOBAL'? 'bg-green-500 text-black' : 'bg-white/10 text-white/30'}`}>LIVE</span>
      </div>
    </div>
  )
}
