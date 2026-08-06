'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function AIMayor() {
  const { zip, city, lat, lng } = useLocation()
  const effectiveZip = zip && zip !== 'GLOBAL' ? zip : 'GLOBAL'
  const effectiveCity = city || (effectiveZip === 'GLOBAL' ? 'your area' : effectiveZip)
  const [brief, setBrief] = useState(`AI Mayor is waking up in ${effectiveCity}...`)
  const [loading, setLoading] = useState(true)

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon' 
    if (hour < 21) return 'Good evening'
    return 'Good night'
  }

    const generateIntelligentBrief = (weather: any, pulse: any, emergency: any) => {
    const greeting = getTimeGreeting()
    const userLocale = typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US'
    const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
    const temp = weather?.temp ? Math.round(weather.temp) : null
    const postCount = pulse?.count || 0
    const hasAlert = emergency?.alert || emergency?.noaa || emergency?.quake
    
    let messages = []
    
    // Greeting + location
    messages.push(`${greeting} ${effectiveCity}`)
    
    // Weather intelligence
    if (temp !== null) {
      if (temp >= 90) messages.push(`🔥 Hot day ahead at ${temp}°F - stay hydrated`)
      else if (temp >= 75) messages.push(`☀️ Pleasant ${temp}°F - great day to be outside`)
      else if (temp >= 60) messages.push(`🌤️ Mild ${temp}°F - perfect conditions`)
      else if (temp >= 45) messages.push(`🧥 Cool ${temp}°F - grab a light jacket`)
      else messages.push(`❄️ Chilly ${temp}°F - bundle up`)
    }
    
    // Community activity
    if (postCount > 10) messages.push(`🏘️ ${postCount} neighbors are active today`)
    else if (postCount > 0) messages.push(`📢 ${postCount} new updates in your area`)
    else messages.push(`📱 Be the first to share in ${effectiveCity}`)
    
    // Emergency intelligence
    if (hasAlert) {
      if (emergency?.noaa) messages.push(`⚠️ Weather alert active - stay informed`)
      if (emergency?.quake) messages.push(`🌍 Seismic activity detected nearby`)
    }
    
    // Date + encouraging close
    messages.push(`📅 ${date}`)
    messages.push(`🤖 Your AI Mayor is watching over ${effectiveCity}`)
    
    return messages.join(' • ')
  }

  useEffect(() => {
    if (effectiveZip === 'GLOBAL') { 
      setBrief('GLOBAL feed - Be the first to share in your area!'); 
      setLoading(false)
      return 
    }
    
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        
        // AUTOMATIC: Get coordinates if needed
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
          } catch (e) {
            console.log('AIMayor: Failed to get coordinates (non-critical):', e)
          }
        }

        // Fetch data from information highway
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
        console.log('AIMayor error:', error)
                if (mounted) {
          const greeting = getTimeGreeting()
          const userLocale = typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US'
          const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
          setBrief(`${greeting} ${effectiveCity} • ${date} • 🤖 AI Mayor is monitoring your area`)
          setLoading(false)
        }
      }
    }
    
    load()
    // Refresh every 5 minutes to keep it current
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [effectiveZip, effectiveCity, city, lat, lng])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-purple-300 font-black text-xs">AI MAYOR • LIVE • {effectiveCity.toUpperCase()}</span>
        {loading && <span className="text-white/40 text-xs animate-pulse">Thinking...</span>}
      </div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
