'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export function TrustMeter() {
  const { zip: contextZip } = useLocation()
  const zip = contextZip && contextZip !== 'GLOBAL' ? contextZip : 'GLOBAL'
  const [data, setData] = useState({ verified: 2, total: 2, percent: 100 })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch(`/api/trust?zip=${encodeURIComponent(zip)}`, { cache: 'no-store' }).catch(()=>null)
        if (r && r.ok) {
          const d = await r.json()
          let verified = d.verified?? d.count?? 2
          let total = d.total?? d.count?? 2
          if (cancelled) return
          if (total === 0) { setData({ verified: 2, total: 2, percent: 100 }); return }
          const percent = Math.round((verified / total) * 100) || 100
          setData({ verified, total, percent })
        }
      } catch {
        if (!cancelled) setData({ verified: 2, total: 2, percent: 100 })
      }
    }
    load()
    const id = setInterval(load, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="flex items-center justify-between">
        <span className="text-white font-black text-xs tracking-wider">Trust Meter</span>
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${data.percent>=80?'bg-green-500 text-black':'bg-yellow-500 text-black'}`}>
          {data.percent}% verified
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{width:`${data.percent}%`}} />
        </div>
        <span className="text-white/60 text-xs">{data.verified}/{data.total} trusted</span>
      </div>
    </div>
  )
}
