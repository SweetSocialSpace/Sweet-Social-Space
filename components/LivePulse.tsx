'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function LivePulse() {
  const { zip, city } = useLocation()
  const [text, setText] = useState(`Right now in ${zip}: Loading live...`)
  const [online, setOnline] = useState(0)

  useEffect(() => {
    const load = async () => {
      if (!zip) return
      try {
        const [weatherRes, pulseRes] = await Promise.all([
          fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null),
          fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        ])
        let temp: number | null = weatherRes?.main?.temp?? weatherRes?.temp?? null
        if (temp!== null && temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
        const tempStr = temp!== null? `${Math.round(temp)}°` : ''

        const liveCount = pulseRes?.count?? pulseRes?.total?? pulseRes?.onlineCount?? 0
        const yardSales = pulseRes?.yardSales?? pulseRes?.marketplaceCount?? 0
        const cityName = city || weatherRes?.name || pulseRes?.city || zip

        setOnline(liveCount)

        if (liveCount > 0 || yardSales > 0) {
          setText(`Right now in ${zip}: ${tempStr? `${tempStr} • ` : ''}${cityName} • ${liveCount} live • ${yardSales} listings nearby`)
        } else {
          setText(`Right now in ${zip}: ${tempStr? `${tempStr} • ` : ''}${cityName} • Your block is quiet - Be first to post!`)
        }
      } catch {
        setText(`Right now in ${zip}: ${city || zip} • Be first to post!`)
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
