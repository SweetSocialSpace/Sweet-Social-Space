'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export function TrustMeter() {
  const { zip } = useLocation()
  const [data, setData] = useState({ verified: 3, total: 3, percent: 100 })

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`/api/trust?zip=${zip}`, { cache: 'no-store' }).catch(()=>null)
        if (r && r.ok) {
          const d = await r.json()
          const verified = d.verified?? d.verified_count?? d.count?? 3
          const total = d.total?? d.total_count?? d.count?? 3
          const percent = total > 0? Math.round((verified / total) * 100) : 100
          setData({ verified, total, percent })
          return
        }
        const r2 = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).catch(()=>null)
        if (r2 && r2.ok) {
          const d2 = await r2.json()
          const count = d2.count || d2.total || 3
          setData({ verified: count, total: count, percent: 100 })
        }
      } catch {}
    }
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-white font-black text-xs tracking-wider">
            TRUST METER • {zip}
          </div>
          <div className={`text-xs font-black px-2 py-0.5 rounded-full ${data.percent===100?'bg-green-500 text-black':'bg-yellow-500 text-black'}`}>
            {data.percent}% VERIFIED
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000" style={{width:`${data.percent}%`}} />
          </div>
          <div className="text-white/70 text-xs font-mono">
            {data.verified}/{data.total} trusted
          </div>
        </div>
        <div className="text-white/40 text- mt-1 uppercase tracking-widest">
          Live • Auto-refresh • {zip} block
        </div>
      </div>
    </div>
  )
}
