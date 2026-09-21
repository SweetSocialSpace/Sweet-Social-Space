'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

export default function AIMayor() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const t = useTranslations() as any

  const effectiveZip = zip && zip!== 'LOCAL'? zip : 'LOCAL'
  const effectiveCity = city || (effectiveZip === 'LOCAL'? (t.aiMayor?.yourArea || 'your area') : effectiveZip)
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    // These will be in your translation files - fallback to English if missing
    if (hour < 12) return t.aiMayor?.goodMorning || 'Good morning'
    if (hour < 17) return t.aiMayor?.goodAfternoon || 'Good afternoon'
    if (hour < 21) return t.aiMayor?.goodEvening || 'Good evening'
    return t.aiMayor?.goodNight || 'Good night'
  }

  const generateIntelligentBrief = (weather: any, pulse: any, emergency: any) => {
    const greeting = getTimeGreeting()
    const localeMap: Record<string, string> = {
      en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP',
      ko: 'ko-KR', pt: 'pt-BR', ru: 'ru-RU', ar: 'ar-SA', hi: 'hi-IN', it: 'it-IT',
      nl: 'nl-NL', tl: 'fil-PH', bn: 'bn-BD', id: 'id-ID', vi: 'vi-VN', th: 'th-TH'
    }
    const userLocale = localeMap[language] || language
    const date = new Date().toLocaleDateString(userLocale, { weekday: 'long', month: 'short', day: 'numeric' })
    const temp = weather?.temp? Math.round(weather.temp) : null
    const postCount = pulse?.count || 0
    const hasAlert = emergency?.alert || emergency?.noaa || emergency?.quake

    let messages: string[] = []

    messages.push(`${greeting} ${effectiveCity}`)

    if (temp!== null) {
      if (temp >= 90) messages.push(t.aiMayor?.hotDay?.replace('{temp}', temp) || `🔥 Hot day ahead at ${temp}°F - stay hydrated`)
      else if (temp >= 75) messages.push(t.aiMayor?.pleasant?.replace('{temp}', temp) || `☀ Pleasant ${temp}°F - great day to be outside`)
      else if (temp >= 60) messages.push(t.aiMayor?.mild?.replace('{temp}', temp) || `🌤 Mild ${temp}°F - perfect conditions`)
      else if (temp >= 45) messages.push(t.aiMayor?.cool?.replace('{temp}', temp) || `🧥 Cool ${temp}°F - grab a light jacket`)
      else messages.push(t.aiMayor?.chilly?.replace('{temp}', temp) || `❄ Chilly ${temp}°F - bundle up`)
    }

    if (postCount > 10) messages.push(t.aiMayor?.neighborsActive?.replace('{count}', postCount) || `🏘 ${postCount} neighbors are active today`)
    else if (postCount > 0) messages.push(t.aiMayor?.newUpdates?.replace('{count}', postCount) || `📢 ${postCount} new updates in your area`)
    else messages.push(t.aiMayor?.beFirst?.replace('{city}', effectiveCity) || `📱 Be the first to share in ${effectiveCity}`)

    if (hasAlert) {
      if (emergency?.noaa) messages.push(t.aiMayor?.weatherAlert || `⚠ Weather alert active - stay informed`)
      if (emergency?.quake) messages.push(t.aiMayor?.seismicAlert || `🌍 Seismic activity detected nearby`)
    }

    messages.push(`📅 ${date}`)
    messages.push(t.aiMayor?.watchingOver?.replace('{city}', effectiveCity) || `🤖 Your AI Mayor is watching over ${effectiveCity}`)

    return messages.join(' • ')
  }

  useEffect(() => {
    if (effectiveZip === 'LOCAL') {
      setBrief(t.aiMayor?.localFeed?.replace('{city}', effectiveCity) || `LOCAL feed - Be the first to share in ${effectiveCity}!`);
      setLoading(false)
      return
    }

    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const [w, p, e] = await Promise.all([
          fetch(`/api/weather?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/pulse?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null),
          fetch(`/api/emergency?zip=${effectiveZip}`).then(r=>r.json()).catch(()=>null)
        ])
        if (mounted) {
          setBrief(generateIntelligentBrief(w, p, e))
          setLoading(false)
        }
      } catch (error) {
        if (mounted) {
          const greeting = getTimeGreeting()
          setBrief(`${greeting} ${effectiveCity} • 🤖 ${t.aiMayor?.monitoring || 'AI Mayor is monitoring your area'}`)
          setLoading(false)
        }
      }
    }

    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [effectiveZip, effectiveCity, city, language, t])

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-purple-300 font-black text-xs">
          {(t.aiMayor?.title || 'AI MAYOR')} • LIVE • {effectiveCity.toUpperCase()}
        </span>
        {loading && <span className="text-white/40 text-xs animate-pulse">{t.common?.loading || 'Thinking...'}</span>}
      </div>
      <div className="text-white text-sm mt-1 leading-relaxed">{brief}</div>
    </div>
  )
}
