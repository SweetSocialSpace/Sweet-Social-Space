'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations, tFormat } from '@/lib/translations'

export default function AIMayor() {
  const { zip, city, lat, lng } = useLocation()
  const { language } = useLanguage()
  const t = useTranslations() as any
  const isEs = language?.toLowerCase().startsWith('es')
  const effectiveZip = zip && zip !== 'LOCAL' ? zip : 'LOCAL'
  const effectiveCity = city || (effectiveZip === 'LOCAL' ? (t?.common?.yourArea || (isEs ? 'tu área' : 'your area')) : effectiveZip)
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t.aiMayor?.goodMorning || (isEs ? 'Buenos días' : 'Good morning')
    if (hour < 17) return t.aiMayor?.goodAfternoon || (isEs ? 'Buenas tardes' : 'Good afternoon')
    if (hour < 21) return t.aiMayor?.goodEvening || (isEs ? 'Buenas noches' : 'Good evening')
    return t.aiMayor?.goodNight || (isEs ? 'Buenas noches' : 'Good night')
  }

  const generateIntelligentBrief = (weather: any, pulse: any, emergency: any) => {
    const greeting = getTimeGreeting()
    const userLocale = isEs ? 'es-US' : 'en-US'
    const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
    const temp = weather?.temp ? Math.round(weather.temp) : null
    const postCount = pulse?.count || 0
    const hasAlert = emergency?.alert || emergency?.noaa || emergency?.quake
    
    let messages: string[] = []
    messages.push(`${greeting} ${effectiveCity}`)
    
    if (temp !== null) {
      if (temp >= 90) messages.push(tFormat(t.aiMayor?.hotDay || (isEs ? 'Día caluroso de {temp}°F - mantente hidratado' : 'Hot day {temp}°F - stay hydrated'), {temp}))
      else if (temp >= 75) messages.push(tFormat(t.aiMayor?.pleasant || (isEs ? '{temp}°F agradable - gran día para salir' : '{temp}°F nice - great day to get out'), {temp}))
      else if (temp >= 60) messages.push(tFormat(t.aiMayor?.mild || (isEs ? '{temp}°F templado - condiciones perfectas' : '{temp}°F mild - perfect conditions'), {temp}))
      else if (temp >= 45) messages.push(tFormat(t.aiMayor?.cool || (isEs ? '{temp}°F fresco - lleva chaqueta ligera' : '{temp}°F cool - bring a light jacket'), {temp}))
      else messages.push(tFormat(t.aiMayor?.chilly || (isEs ? '{temp}°F frío - abrígate' : '{temp}°F cold - bundle up'), {temp}))
    }
    
    if (postCount > 10) messages.push(tFormat(t.aiMayor?.neighborsActive || (isEs ? '{count} vecinos activos hoy' : '{count} neighbors active today'), {count: postCount}))
    else if (postCount > 0) messages.push(tFormat(t.aiMayor?.newUpdates || (isEs ? '{count} nuevas actualizaciones en tu área' : '{count} new updates in your area'), {count: postCount}))
    else messages.push(tFormat(t.aiMayor?.beFirst || (isEs ? 'Sé el primero en compartir en {city}' : 'Be the first to share in {city}'), {city: effectiveCity}))
    
    if (hasAlert) {
      if (emergency?.noaa) messages.push(t.aiMayor?.weatherAlert || (isEs ? 'Alerta meteorológica activa - mantente informado' : 'Weather alert active - stay informed'))
      if (emergency?.quake) messages.push(t.aiMayor?.seismic || (isEs ? 'Actividad sísmica detectada cerca' : 'Seismic activity detected nearby'))
    }
    
    messages.push(`📅 ${date}`)
    messages.push(tFormat(t.aiMayor?.watchingOver || (isEs ? 'Tu Alcalde AI vigila {city}' : 'Your AI Mayor watches over {city}'), {city: effectiveCity}))
    
    return messages.join(' • ')
  }

  useEffect(() => {
    setBrief(tFormat(t.aiMayor?.wakingUp || (isEs ? 'Alcalde AI despertando en {city}...' : 'AI Mayor waking up in {city}...'), {city: effectiveCity}))
  }, [t, effectiveCity, isEs])

  useEffect(() => {
    if (effectiveZip === 'LOCAL') { 
      setBrief(t.aiMayor?.localFeed || (isEs ? 'Feed LOCAL - ¡Sé el primero en compartir en tu área!' : 'LOCAL Feed - Be the first to share in your area!')); 
      setLoading(false)
      return 
    }
    
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        let useLat = lat
        let useLng = lng
        if (!useLat || !useLng) {
          try {
            const geoRes = await fetch(`/api/zips?zip=${effectiveZip}`)
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              if (geoData.lat && geoData.lon) {
                useLat = parseFloat(geoData.lat)
                useLng = parseFloat(geoData.lon)
              }
            }
          } catch (e) {}
        }

        const [w, p, e] = await Promise.all([
          fetch(`/api/weather?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/pulse?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/emergency?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null)
        ])

        if (mounted) {
          const newBrief = generateIntelligentBrief(w, p, e)
          setBrief(newBrief)
          setLoading(false)
        }
      } catch (error) {
        if (mounted) {
          const greeting = getTimeGreeting()
          const userLocale = isEs ? 'es-US' : 'en-US'
          const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
          setBrief(`${greeting} ${effectiveCity} • ${date} • ${t.aiMayor?.monitoring || (isEs ? 'Alcalde AI monitorea tu área' : 'AI Mayor monitoring your area')}`)
          setLoading(false)
        }
      }
    }
    
    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [effectiveZip, effectiveCity, city, lat, lng, t, language, isEs])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-purple-300 font-black text-xs">AI MAYOR • {t.aiMayor?.live || (isEs ? 'EN VIVO' : 'LIVE')} • {(effectiveCity || (isEs ? 'TU ÁREA' : 'YOUR AREA')).toUpperCase()}</span>
        {loading && <span className="text-white/40 text-xs animate-pulse">{t.aiMayor?.thinking || (isEs ? 'Pensando...' : 'Thinking...')}</span>}
      </div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
