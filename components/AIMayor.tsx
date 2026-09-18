'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations, tFormat } from '@/lib/translations'

export default function AIMayor() {
  const { zip, city, lat, lng } = useLocation()
  const { language } = useLanguage()
  const t = useTranslations() as any
  const effectiveZip = zip && zip !== 'LOCAL' ? zip : 'LOCAL'
  const effectiveCity = city || (effectiveZip === 'LOCAL' ? t?.common?.yourArea : effectiveZip)
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t.aiMayor?.goodMorning
    if (hour < 17) return t.aiMayor?.goodAfternoon
    if (hour < 21) return t.aiMayor?.goodEvening
    return t.aiMayor?.goodNight
  }

  const generateIntelligentBrief = (weather: any, pulse: any, emergency: any) => {
    const greeting = getTimeGreeting()
    const userLocale = language || 'en-US'
    const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
    const temp = weather?.temp ? Math.round(weather.temp) : null
    const postCount = pulse?.count || 0
    const hasAlert = emergency?.alert || emergency?.noaa || emergency?.quake
    
    let messages: string[] = []
    messages.push(`${greeting} ${effectiveCity}`)
    
    if (temp !== null) {
      if (temp >= 90) messages.push(tFormat(t.aiMayor?.hotDay, {temp}))
      else if (temp >= 75) messages.push(tFormat(t.aiMayor?.pleasant, {temp}))
      else if (temp >= 60) messages.push(tFormat(t.aiMayor?.mild, {temp}))
      else if (temp >= 45) messages.push(tFormat(t.aiMayor?.cool, {temp}))
      else messages.push(tFormat(t.aiMayor?.chilly, {temp}))
    }
    
    if (postCount > 10) messages.push(tFormat(t.aiMayor?.neighborsActive, {count: postCount}))
    else if (postCount > 0) messages.push(tFormat(t.aiMayor?.newUpdates, {count: postCount}))
    else messages.push(tFormat(t.aiMayor?.beFirst, {city: effectiveCity}))
    
    if (hasAlert) {
      if (emergency?.noaa) messages.push(t.aiMayor?.weatherAlert)
      if (emergency?.quake) messages.push(t.aiMayor?.seismic)
    }
    
    messages.push(`📅 ${date}`)
    messages.push(tFormat(t.aiMayor?.watchingOver, {city: effectiveCity}))
    
    return messages.join(' • ')
  }

  useEffect(() => {
    setBrief(tFormat(t.aiMayor?.wakingUp, {city: effectiveCity}))
  }, [t, effectiveCity])

  useEffect(() => {
    if (effectiveZip === 'LOCAL') { 
      setBrief(t.aiMayor?.localFeed); 
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
          const userLocale = language || 'en-US'
          const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
          setBrief(`${greeting} ${effectiveCity} • ${date} • ${t.aiMayor?.monitoring}`)
          setLoading(false)
        }
      }
    }
    
    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [effectiveZip, effectiveCity, city, lat, lng, t, language])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-purple-300 font-black text-xs">AI MAYOR • {t.aiMayor?.live} • {(effectiveCity || t?.common?.yourArea).toUpperCase()}</span>
        {loading && <span className="text-white/40 text-xs animate-pulse">{t.aiMayor?.thinking}</span>}
      </div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
