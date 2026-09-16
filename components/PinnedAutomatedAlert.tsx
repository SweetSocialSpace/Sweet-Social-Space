'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations, tFormat } from '@/lib/translations'

type AlertRow = { title: string; body: string } | null

export function PinnedAutomatedAlert() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const isEs = language?.toLowerCase().startsWith('es')
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
            title: nwsAlerts[0].event || (t?.alerts?.weatherAlert || (isEs ? 'Alerta Meteorológica' : 'Weather Alert')),
            body: nwsAlerts[0].description || nwsAlerts[0].event
          })
          return
        }
        let temp = data?.temp ?? data?.main?.temp ?? null
        if (temp && temp > 150) { try { temp = (temp - 273.15) * 9/5 + 32 } catch {} }
        if (temp && temp >= 90) {
          if (mounted) setAlert({
            title: t?.alerts?.heatAdvisory || (isEs ? 'Aviso de Calor' : 'Heat Advisory'),
            body: t?.alerts?.highHeat ? tFormat(t.alerts.highHeat, { temp: Math.round(temp), city: city || zip }) : (isEs ? `Calor alto ${Math.round(temp)}°F en ${city || zip} - mantente hidratado` : `High heat ${Math.round(temp)}°F in ${city || zip} - stay hydrated`)
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
  }, [zip, city, t, language, isEs])

  const displayArea = zip && zip!== 'GLOBAL'? zip : (t?.common?.yourArea || (isEs ? 'tu área' : 'your area'))

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">📌 {t?.alerts?.pinnedAlert || (isEs ? 'Alerta Fijada' : 'Pinned Alert')} <span className="ml-auto bg-green-500 text-black px-2 py-0.5 rounded-full text-xs font-black">{t?.alerts?.live || t?.live?.live || t?.weather?.live || (isEs ? 'EN VIVO' : 'LIVE')}</span></div>
        <div className="text-white/80 text-sm mt-2">{t?.alerts?.noEmergenciesIn ? tFormat(t.alerts.noEmergenciesIn, { zip: displayArea }) : (isEs ? `No hay emergencias en ${displayArea}` : `No emergencies in ${displayArea}`)}</div>
      </div>
    )
  }
  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 text-white font-black text-sm">📌 {t?.alerts?.pinnedAlert || (isEs ? 'Alerta Fijada' : 'Pinned Alert')} <span className="ml-auto bg-orange-500 text-black px-2 py-0.5 rounded-full text-xs font-black">{t?.alerts?.live || t?.live?.live || t?.weather?.live || (isEs ? 'EN VIVO' : 'LIVE')}</span></div>
      <div className="text-orange-300 font-bold text-sm mt-2">{alert.title}</div>
      <div className="text-white/70 text-xs mt-1">{alert.body}</div>
    </div>
  )
}

export default PinnedAutomatedAlert
