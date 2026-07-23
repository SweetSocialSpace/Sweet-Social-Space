'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function AIMayor() {
  const { zip, city } = useLocation()
  const [brief, setBrief] = useState(`Good morning ${city || zip} - Brewing your block briefing...`)

  useEffect(() => {
    const load = async () => {
      if (!zip) return
      try {
        const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        let temp = w?.main?.temp ?? w?.temp ?? null
        if (temp!== null && temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
        const tempStr = temp!== null? `${Math.round(temp)}°` : ''
        const cond = w?.weather?.[0]?.main || ''
        const p = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const postCount = p?.count ?? p?.total ?? 0
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

        // FIX: Trust weather name first - that's Fort Edward for 12828
        const realCity = w?.name || p?.city || ''
        // If realCity exists and is not the same as zip, use it. Otherwise don't duplicate.
        const locationDisplay = realCity && realCity !== zip ? `${realCity} ${zip}` : zip

        if (postCount > 0) {
          setBrief(`☀ Good morning ${locationDisplay} - ${date} - ${tempStr} ${cond} - ${postCount} new post${postCount>1?'s':''} on your block - No alerts - Have a good one, neighbor.`)
        } else {
          setBrief(`☀ Good morning ${locationDisplay} - ${date} - ${tempStr} ${cond} - Your block is quiet - Be first to post! - Have a good day.`)
        }
      } catch {
        setBrief(`Good morning ${city || zip} - Your block is quiet - Be first to post!`)
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

