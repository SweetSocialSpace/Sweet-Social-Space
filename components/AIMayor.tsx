'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'

export default function AIMayor() {
  const { zip, city, lat, lng } = useLocation()
  const t = useTranslations() as any
  const effectiveZip = zip && zip !== 'LOCAL' ? zip : 'LOCAL'
  const effectiveCity = city || (effectiveZip === 'LOCAL' ? 'your area' : effectiveZip)
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t.aiMayor?.goodMorning || 'Good morning'
    if (hour < 17) return t.aiMayor?.goodAfternoon || 'Good afternoon'
    if (hour < 21) return t.aiMayor?.goodEvening || 'Good evening'
    return t.aiMayor?.goodNight || 'Good night'
  }

  const format = (str: string, vars: Record<string,string|number>) => {
    let s = str
    for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]))
    return s
  }

  const generateIntelligentBrief = (weather: any, pulse: any, emergency: any) => {
    const greeting = getTimeGreeting()
    const userLocale = typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US'
    const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
    const temp = weather?.temp ? Math.round(weather.temp) : null
    const postCount = pulse?.count || 0
    const hasAlert = emergency?.alert || emergency?.noaa || emergency?.quake
    
    let messages: string[] = []
    messages.push(`${greeting} ${effectiveCity}`)
    
    if (temp !== null) {
      if (temp >= 90) messages.push(format(t.aiMayor?.hotDay || 'Hot day ahead at {temp}°F - stay hydrated', {temp}))
      else if (temp >= 75) messages.push(format(t.aiMayor?.pleasant || 'Pleasant {temp}°F - great day to be outside', {temp}))
      else if (temp >= 60) messages.push(format(t.aiMayor?.mild || 'Mild {temp}°F - perfect conditions', {temp}))
      else if (temp >= 45) messages.push(format(t.aiMayor?.cool || 'Cool {temp}°F - grab a light jacket', {temp}))
      else messages.push(format(t.aiMayor?.chilly || 'Chilly {temp}°F - bundle up', {temp}))
    }
    
    if (postCount > 10) messages.push(format(t.aiMayor?.neighborsActive || '{count} neighbors are active today', {count: postCount}))
    else if (postCount > 0) messages.push(format(t.aiMayor?.newUpdates || '{count} new updates in your area', {count: postCount}))
    else messages.push(format(t.aiMayor?.beFirst || 'Be the first to share in {city}', {city: effectiveCity}))
    
    if (hasAlert) {
      if (emergency?.noaa) messages.push(t.aiMayor?.weatherAlert || 'Weather alert active - stay informed')
      if (emergency?.quake) messages.push(t.aiMayor?.seismic || 'Seismic activity detected nearby')
    }
    
    messages.push(`📅 ${date}`)
    messages.push(format(t.aiMayor?.watchingOver || 'Your AI Mayor is watching over {city}', {city: effectiveCity}))
    
    return messages.join(' • ')
  }

  useEffect(() => {
    // set initial waking message
    setBrief(format(t.aiMayor?.wakingUp || 'AI Mayor is waking up in {city}...', {city: effectiveCity}))
  }, [t, effectiveCity])

  useEffect(() => {
    if (effectiveZip === 'LOCAL') { 
      setBrief(t.aiMayor?.localFeed || 'LOCAL feed - Be the first to share in your area!'); 
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
          const userLocale = typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US'
          const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
          setBrief(`${greeting} ${effectiveCity} • ${date} • ${t.aiMayor?.monitoring || 'AI Mayor is monitoring your area'}`)
          setLoading(false)
        }
      }
    }
    
    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [effectiveZip, effectiveCity, city, lat, lng, t])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-purple-300 font-black text-xs">AI MAYOR • {t.aiMayor?.live || 'LIVE'} • {effectiveCity.toUpperCase()}</span>
        {loading && <span className="text-white/40 text-xs animate-pulse">{t.aiMayor?.thinking || 'Thinking...'}</span>}
      </div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
