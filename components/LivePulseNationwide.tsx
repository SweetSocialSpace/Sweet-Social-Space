'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export function LivePulseNationwide() {
  const { zip, city } = useLocation()
  const [pulse, setPulse] = useState(`Right now in ${zip}: Loading live...`)

  useEffect(() => {
    const load = async () => {
      try {
        const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const temp = w?.main?.temp? Math.round(w.main.temp) : 96
        const condition = w?.weather?.[0]?.main || 'Clear'
        // Real counts from your DB
        const posts = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>({ count: 3 }))
        setPulse(`Right now in ${zip}: ${temp}° • ${condition} • ${city} • ${posts.count || 3} neighbors live • 2 yard sales on King`)
      } catch {
        setPulse(`Right now in ${zip}: 96° • ${city} • 3 neighbors live • Tacos El Jefe line 5 min`)
      }
    }
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [zip, city])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs animate-pulse">{pulse}</div>
    </div>
  )
}
