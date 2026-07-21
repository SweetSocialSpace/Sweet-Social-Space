'use client'
import { useEffect, useState } from 'react'

type AlertRow = { id: string; title?: string; body?: string }

export function PinnedAutomatedAlert() {
  const [alert, setAlert] = useState<AlertRow | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        // 1. Check live emergency API - real NWS data
        const res = await fetch('/api/emergency?zip=95122', { cache: 'no-store' }).catch(()=>null)
        if (res && res.ok) {
          const data = await res.json()
          if (data && data[0] && mounted) {
            // Real alert exists in real world
            setAlert({ id: data[0].id, title: data[0].title, body: data[0].body || data[0].message })
            return
          }
        }
        // 2. Check weather API for real alerts
        const res2 = await fetch('/api/weather?zip=95122', { cache: 'no-store' }).catch(()=>null)
        if (res2 && res2.ok) {
          const w = await res2.json()
          if (w.alerts && w.alerts[0] && mounted) {
            setAlert({ id: 'nws', title: w.alerts[0].event, body: w.alerts[0].description })
            return
          }
          // If temp is 90+ right now, it's real heat advisory from real temp outside
          const temp = w?.main?.temp
          if (temp && temp >= 90 && mounted) {
            setAlert({
              id: 'heat-live',
              title: 'Heat Advisory • Weather',
              body: `High heat ${Math.round(temp)}°F in 95122 right now - Be cautious, stay hydrated. Live from OpenWeather`
            })
            return
          }
        }
        // 3. No real emergency outside right now = No emergencies
        if (mounted) setAlert(null)
      } catch {
        if (mounted) setAlert(null)
      }
    }

    load()
    const id = setInterval(load, 300000) // checks real world every 5 min
    return () => { mounted = false; clearInterval(id) }
  }, [])

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
        <div className="text-white/80 text-sm mt-2">No emergencies in 95122</div>
      </div>
    )
  }

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
      <div className="text-orange-300 font-bold text-sm mt-2">{alert.title}</div>
      <div className="text-white/70 text-xs mt-1">{alert.body?.substring(0, 180)}</div>
    </div>
  )
}
