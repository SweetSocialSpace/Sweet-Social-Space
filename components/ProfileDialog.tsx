'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'

type AlertRow = { title: string; body: string } | null

export function PinnedAutomatedAlert() {
  const { zip, city } = useLocation()
  const t = useTranslations() as any
  const [alert, setAlert] = useState<AlertRow>(null)

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') {
      setAlert(null)
      return
    }
    let mounted = true
    const loadRealWorld = async () => {
      try {
        const r = await fetch(`/api/weather?zip=${encodeURIComponent(zip)}`, { cache: 'no-store' })
        if (!r.ok) { if (mounted) setAlert(null); return }
        const data = await r.json()
        const nwsAlerts = data.alerts || data?.weather?.alerts || []
        if (nwsAlerts && nwsAlerts[0]) {
          if (mounted) setAlert({
            title: nwsAlerts[0].event || (t?.alerts?.weatherAlert || 'Weather Alert'),
            body: nwsAlerts[0].description || nwsAlerts[0].event
          })
          return
        }
        let temp = data?.temp?? data?.main?.temp?? null
        if (temp && temp > 150) { try { temp = (temp - 273.15) * 9/5 + 32 } catch {} }
        if (temp && temp >= 90) {
          if (mounted) setAlert({
            title: t?.alerts?.heatAdvisory || `Heat Advisory`,
            body: `${t?.alerts?.highHeat || 'High heat'} ${Math.round(temp)}°F ${t?.alerts?.in || 'in'} ${city || zip} - ${t?.alerts?.stayHydrated || 'stay hydrated'}`
          })
          return
        }
        if (mounted) setAlert(null)
      } catch {
        if (mounted) setAlert(null)
      }
    }
    loadRealWorld()
    const id = setInterval(loadRealWorld, 60000)
    return () => { mounted = false; clearInterval(id) }
  }, [zip, city, t])

  const displayArea = zip && zip!== 'GLOBAL'? zip : (t?.common?.yourArea || 'your area')

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">📌 {t?.alerts?.pinnedAlert || 'Pinned Alert'} <span className="ml-auto text- bg-green-500 text-black px-2 py-0.5 rounded-full">{t?.live?.live || 'LIVE'}</span></div>
        <div className="text-white/80 text-sm mt-2">{t?.alerts?.noEmergenciesIn || 'No emergencies in'} {displayArea}</div>
      </div>
    )
  }
  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 text-white font-black text-sm">📌 {t?.alerts?.pinnedAlert || 'Pinned Alert'} <span className="ml-auto text- bg-orange-500 text-black px-2 py-0.5 rounded-full">{t?.live?.live || 'LIVE'}</span></div>
      <div className="text-orange-300 font-bold text-sm mt-2">{alert.title}</div>
      <div className="text-white/70 text-xs mt-1">{alert.body}</div>
    </div>
  )
}
