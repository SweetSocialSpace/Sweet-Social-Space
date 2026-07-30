'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function AIMayor() {
  const { zip, city } = useLocation()
  const [brief, setBrief] = useState('Brewing your block briefing...')

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') {
      setBrief('Your block is quiet - Be first to post!')
      return
    }

    const controller = new AbortController()

    const load = async () => {
      try {
        const [wRes, pRes] = await Promise.all([
          fetch(`/api/weather?zip=${zip}`, { cache: 'no-store', signal: controller.signal }).then(r => r.json()).catch(()=>null),
          fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store', signal: controller.signal }).then(r => r.json()).catch(()=>null)
        ])

        // Normalize temp - handles Kelvin, Celsius, or Fahrenheit from APIs
        let temp = wRes?.current?.temp?? wRes?.main?.temp?? wRes?.temp?? null
        if (temp!== null) {
          if (temp > 150) temp = (temp - 273.15) * 9/5 + 32 // Kelvin -> F
          else if (temp < 60) temp = temp * 9/5 + 32 // Assume C -> F if small number
        }

        const tempStr = temp!== null? `${Math.round(temp)}°` : ''
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        const locationStr = city || zip
        const count = pRes?.count?? pRes?.total?? 0

        if (count > 0) {
          setBrief(`Good morning ${locationStr} — ${date} ${tempStr? `· ${tempStr}` : ''} — ${count} new post${count > 1? 's' : ''} on your block`)
        } else {
          setBrief(`Good morning ${locationStr} — ${date} ${tempStr? `· ${tempStr}` : ''} — Your block is quiet — Be first to post!`)
        }
      } catch {
        if (!controller.signal.aborted) {
          setBrief('Your block is quiet - Be first to post!')
        }
      }
    }

    load()
    return () => controller.abort()
  }, [zip, city])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-purple-300 font-black text-xs tracking-widest">AI MAYOR</span>
        <span className="text- bg-white/10 text-white/60 px-2 py-0.5 rounded-full">LIVE</span>
      </div>
      <div className="text-white text-sm leading-snug">{brief}</div>
    </div>
  )
}
