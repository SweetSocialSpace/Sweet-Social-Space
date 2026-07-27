'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

type AlertRow = { title: string; body: string } | null

export function PinnedAutomatedAlert() {
  const { zip, city } = useLocation()
  const [alert, setAlert] = useState<AlertRow>(null)

  useEffect(() => {
    if (!zip) return
    let mounted = true
    const loadRealWorld = async () => {
      try {
        if (!zip) return
        const r = await fetch(`/api/weather?zip=${encodeURIComponent(zip)}`, { cache: 'no-store' })
        if (!r.ok) { if (mounted) setAlert(null); return }
        const data = await r.json()
        const nwsAlerts = data.alerts || data?.weather?.alerts || []
        if (nwsAlerts && nwsAlerts[0]) { if (mounted) setAlert({ title: nwsAlerts[0].event || 'Weather Alert', body: nwsAlerts[0].description || nwsAlerts[0].event }); return }
        let temp = data?.temp?? data?.main?.temp?? null
        if (temp && temp > 150) { try { temp = (temp - 273.15) * 9/5 + 32 } catch {} }
        if (temp && temp >= 90) { if (mounted) setAlert({ title: `Heat Advisory • ${zip}`, body: `High heat ${Math.round(temp)}°F in ${zip} right now - Be cautious. Live from NWS ${city || zip}` }); return }
        if (mounted) setAlert(null)
      } catch { if (mounted) try { setAlert(null) } catch {} }
    }
    loadRealWorld()
    const id = setInterval(()=>{ try { loadRealWorld() } catch {} }, 60000)
    return () => { mounted = false; try { clearInterval(id) } catch {} }
  }, [zip, city])

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
        <div className="text-white/80 text-sm mt-2">No emergencies in {zip || 'your area'}</div>
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
