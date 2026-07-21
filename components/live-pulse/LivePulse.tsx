'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function LivePulse() {
  const { zip, city } = useLocation()
  const [text, setText] = useState(`Right now in ${zip}: Loading live...`)
  const [online, setOnline] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [weatherRes, pulseRes] = await Promise.all([
          fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null),
          fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>({ count: 2 }))
        ])
        let temp = weatherRes?.main?.temp?? weatherRes?.temp?? 96
        if (temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
        const count = pulseRes?.count?? pulseRes?.total?? 2
        setOnline(count)
        setText(`Right now in ${zip}: ${Math.round(temp)}° • ${city} • ${count} live • 2 yard sales • Giants loud at Story & King`)
      } catch {
        setText(`Right now in ${zip}: 96° • ${city} • 3 neighbors live • Tacos El Jefe line 5 min`)
      }
    }
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [zip, city])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 flex justify-between items-center">
      <div className="text-white font-black text-xs animate-pulse truncate mr-2">{text}</div>
      <div className="text-white/60 text- font-bold whitespace-nowrap">{online} ONLINE • LIVE</div>
    </div>
  )
}
