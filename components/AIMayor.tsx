'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

export default function AIMayor() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const t = useTranslations() as any

  const effectiveZip = zip && zip !== 'LOCAL' ? zip : 'LOCAL'
  const effectiveCity = city || effectiveZip
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        
        // Get data
        const [w, p, e] = await Promise.all([
          fetch(`/api/weather?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/pulse?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/emergency?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null)
        ])

        if (!mounted) return

        const hour = new Date().getHours()
        let greetKey = 'goodMorning'
        if (hour >= 12 && hour < 17) greetKey = 'goodAfternoon'
        if (hour >= 17 && hour < 21) greetKey = 'goodEvening'
        if (hour >= 21) greetKey = 'goodNight'

        const greet = t.aiMayor?.[greetKey] || greetKey
        const temp = w?.temp ? Math.round(w.temp) : null
        const count = p?.count || 0
        
        const locale = language
        const dateStr = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })

        let parts: string[] = []
        parts.push(`${greet} ${effectiveCity}`)

        if (temp !== null) {
          let tempKey = 'mild'
          if (temp >= 90) tempKey = 'hotDay'
          else if (temp >= 75) tempKey = 'pleasant'
          else if (temp >= 45) tempKey = 'cool'
          else if (temp < 45) tempKey = 'chilly'
          
          const template = t.aiMayor?.[tempKey] || '{temp}°F'
          parts.push(template.replace('{temp}', String(temp)))
        }

        if (count > 0) {
          const template = count > 10 ? t.aiMayor?.neighborsActive : t.aiMayor?.newUpdates
          if (template) parts.push(template.replace('{count}', String(count)))
        } else {
          if (t.aiMayor?.beFirst) parts.push(t.aiMayor.beFirst.replace('{city}', effectiveCity))
        }

        if (e?.noaa && t.aiMayor?.weatherAlert) parts.push(t.aiMayor.weatherAlert)
        if (e?.quake && t.aiMayor?.seismicAlert) parts.push(t.aiMayor.seismicAlert)

        parts.push(`📅 ${dateStr}`)
        if (t.aiMayor?.watchingOver) parts.push(t.aiMayor.watchingOver.replace('{city}', effectiveCity))

        setBrief(parts.join(' • '))
        setLoading(false)

      } catch {
        if (mounted) setLoading(false)
      }
    }

    if (effectiveZip === 'LOCAL') {
      const msg = t.aiMayor?.localFeed?.replace('{city}', effectiveCity) || effectiveCity
      setBrief(msg)
      setLoading(false)
    } else {
      load()
    }

    const interval = setInterval(load, 5 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [effectiveZip, effectiveCity, language, t])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-purple-300 font-black text-xs">
          {t.aiMayor?.title || 'AI MAYOR'} • LIVE • {effectiveCity.toUpperCase()}
        </span>
        {loading && <span className="text-white/40 text-xs animate-pulse">{t.common?.loading || ''}</span>}
      </div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
