'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function AIMayor() {
  const { zip, city } = useLocation()
  const effectiveZip = zip && zip !== 'GLOBAL' ? zip : 'GLOBAL'
  const effectiveCity = city || (effectiveZip === 'GLOBAL' ? 'your area' : effectiveZip)
  const [brief, setBrief] = useState(`Brewing briefing for ${effectiveCity}...`)

  useEffect(() => {
    if (effectiveZip === 'GLOBAL') { 
      setBrief('GLOBAL feed is quiet - Be first to post in your area!'); 
      return 
    }
    const load = async () => {
      try {
        const w = await fetch(`/api/weather?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null)
        const p = await fetch(`/api/pulse?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null)
        const tempStr = w?.temp ? `${Math.round(w.temp)}°` : ''
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        const cityName = w?.city || city || effectiveZip
        setBrief(`Good morning ${cityName} — ${date} ${tempStr} — ${p?.count || 0} new posts in your area`)
      } catch {
        setBrief(`Good morning ${effectiveCity} — ${new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})} — Check your area feed`)
      }
    }
    load()
  }, [effectiveZip, effectiveCity, city])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <span className="text-purple-300 font-black text-xs">AI MAYOR • LIVE • {effectiveCity.toUpperCase()}</span>
      <div className="text-white text-sm mt-1">{brief}</div>
    </div>
  )
}
