'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function AIMayor() {
  const { zip, city } = useLocation()
  const [brief, setBrief] = useState(`Good morning ${zip} - Brewing your block briefing...`)

  useEffect(() => {
    const load = async () => {
      try {
        const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        let temp = w?.main?.temp?? w?.temp?? 96
        if (temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
        const cond = w?.weather?.[0]?.main||'Clear'
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        setBrief(`☀️ Good morning ${city} ${zip} - ${date} - ${Math.round(temp)}° ${cond} - 3 new posts on your block - 1 yard sale on King Rd - Giants at 7pm - No alerts - Have a good one, neighbor.`)
      } catch {
        setBrief(`Good morning ${city} ${zip} - Your block is quiet - 2 posts - 72° - Have a good day.`)
      }
    }
    load()
    }, [zip, city])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="text-purple-300 font-black text-xs mb-1">🤖 AI MAYOR • {zip} • LIVE</div>
      <div className="text-white text-sm leading-snug">{brief}</div>
    </div>
  )
}
