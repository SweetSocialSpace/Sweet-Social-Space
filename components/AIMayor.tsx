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
    const load = async () => {
      try {
        const w = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        const p = await fetch(`/api/pulse?zip=${zip}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
        let temp = w?.main?.temp?? w?.temp?? null
        if (temp!== null && temp > 150) temp = Math.round((temp - 273.15) * 9/5 + 32)
        const tempStr = temp!== null? `${Math.round(temp)}°` : ''
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        const count = p?.count?? p?.total?? 0
        if (count > 0) {
          setBrief(`Good morning - ${date} - ${tempStr} - ${count} new post${count>1?'s':''} on your block`)
        } else {
          setBrief(`Good morning - ${date} - ${tempStr} - Your block is quiet - Be first to post!`)
        }
      } catch {
        setBrief('Your block is quiet - Be first to post!')
      }
    }
    load()
  }, [zip])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-purple-300 font-black text-xs">AI Mayor</span>
        <span className="text- bg-white/10 text-white/60 px-2 py-0.5 rounded-full">LIVE</span>
      </div>
      <div className="text-white text-sm leading-snug">{brief}</div>
    </div>
  )
}
