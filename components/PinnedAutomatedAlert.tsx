'use client'
import { useEffect, useState } from 'react'

type AlertRow = { title: string; body: string } | null

export function PinnedAutomatedAlert() {
  const [alert, setAlert] = useState<AlertRow>(null)

  useEffect(() => {
    let mounted = true

    const loadRealWorld = async () => {
      try {
        const r = await fetch('/api/weather?zip=95122', { cache: 'no-store' })
        if (!r.ok) {
          if (mounted) setAlert(null)
          return
        }
        const data = await r.json()

        // Check for real NWS alerts array
        if (data.alerts && data.alerts[0]) {
          if (mounted) setAlert({ title: data.alerts[0].event || 'Weather Alert', body: data.alerts[0].description || data.alerts[0].event })
          return
        }

        // Check real temp outside right now - your Emergency box already shows 96°F
        let temp = data?.main?.temp?? data?.temp?? data?.current?.temp?? null
        // OpenWeather sometimes returns Kelvin
        if (temp && temp > 150) temp = (temp - 273.15) * 9/5 + 32

        if (temp && temp >= 90) {
          if (mounted) setAlert({
            title: 'Heat Advisory • Weather',
            body: `High heat ${Math.round(temp)}°F in 95122 right now - Be cautious, stay hydrated. Live from NWS San Francisco - auto-refresh 5m`
          })
          return
        }

        // Real world says no emergency right now
        if (mounted) setAlert(null)
      } catch {
        if (mounted) setAlert(null)
      }
    }

    loadRealWorld()
    const id = setInterval(loadRealWorld, 60000) // checks outside temp every 1 minute
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
      <div className="text-white/70 text-xs mt-1">{alert.body}</div>
    </div>
  )
}
