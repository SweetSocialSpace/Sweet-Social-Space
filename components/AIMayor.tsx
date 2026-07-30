'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function AIMayor() {
  const { zip, city } = useLocation()
  const effectiveZip = zip || 'GLOBAL'
  const effectiveCity = city || 'your area'
  const [brief, setBrief] = useState(`Brewing briefing for ${effectiveCity}...`)

  useEffect(() => {
    if (effectiveZip === 'GLOBAL') { setBrief('GLOBAL feed is quiet - Be first to post!'); return }
    const load = async () => {
      const z = await fetch(`/api/zips?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>({ city: effectiveCity }))
      const w = await fetch(`/api/weather?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null)
      const p = await fetch(`/api/pulse?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null)
      const tempStr = w?.temp? `${Math.round(w.temp)}°` : ''
      const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      setBrief(`Good morning ${z.city || effectiveCity} — ${date} ${tempStr} — ${p?.count || 0} new posts in your area`)
    }
    load()
  }, [effectiveZip, effectiveCity])
  return <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
    <span className="text-purple-300 font-black text-xs">AI MAYOR • {effectiveCity}</span>
    <div className="text-white text-sm">{brief}</div>
  </div>
}
