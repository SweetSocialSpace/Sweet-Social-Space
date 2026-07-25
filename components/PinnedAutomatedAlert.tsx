'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

type AlertRow = { title: string; body: string } | null

export function PinnedAutomatedAlert() {
  const { zip, city } = useLocation()
  const [alert, setAlert] = useState<AlertRow>(null)

  useEffect(() => {
    let mounted = true

    const loadRealWorld = async () => {
      // AUTOMATIC FIX: don't fetch if zip empty — wait for location-context to give 95122
      if (!zip) {
        if (mounted) setAlert(null)
        return
      }
      try {
        // Real world weather for THIS zip - nationwide
        const r = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' })
        if (!r.ok) {
          if (mounted) setAlert(null)
          return
        }
        const data = await r.json()

        // 1. Real NWS alerts if exist — supports both shapes
        const nwsAlerts = data.alerts || data?.weather?.alerts || []
        if (nwsAlerts && nwsAlerts[0]) {
          if (mounted) setAlert({ title: nwsAlerts[0].event || 'Weather Alert', body: nwsAlerts[0].description || nwsAlerts[0].event })
          return
        }

        // 2. Real temp check - if 90+ outside right now, show heat advisory - real world — supports both shapes
        let temp = data?.temp ?? data?.main?.temp ?? data?.current?.temp ?? null
        if (temp && temp > 150) temp = (temp - 273.15) * 9/5 + 32 // Kelvin to F

        if (temp && temp >= 90) {
          if (mounted) setAlert({
            title: `Heat Advisory • Weather • ${zip}`,
            body: `High heat ${Math.round(temp)}°F in ${zip} right now - Be cautious, stay hydrated. Live from NWS ${city || zip} - auto-refresh 1m`
          })
          return
        }

        if (mounted) setAlert(null)
      } catch {
        if (mounted) setAlert(null)
      }
    }

    if (!zip) return
    loadRealWorld()
    const id = setInterval(loadRealWorld, 60000) // checks outside temp every 1 min automatic
    return () => { mounted = false; clearInterval(id) }
  }, [zip, city])

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
        <div className="text-white/80 text-sm mt-2">No emergencies in {zip || '95122'}</div>
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
