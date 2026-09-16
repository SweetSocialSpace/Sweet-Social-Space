'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations, tFormat } from '@/lib/translations'

export default function WeatherBar() {
  const { zip: globalZip, city: globalCity } = useLocation()
  const { language } = useLanguage()
  const zip = globalZip && globalZip!== 'YOUR NEIGHBORHOOD'? globalZip : ''
  const [temp, setTemp] = useState<number | null>(null)
  const [desc, setDesc] = useState('')
  const [city, setCity] = useState('')

  const t = useTranslations() as any

  // Hardcoded English → Spanish weather map as ultimate fallback if translate API fails
  const weatherMap: Record<string, string> = {
    'clear sky': 'cielo claro',
    'few clouds': 'pocas nubes',
    'scattered clouds': 'nubes dispersas',
    'broken clouds': 'nubes rotas',
    'overcast clouds': 'nublado',
    'shower rain': 'llovizna',
    'rain': 'lluvia',
    'light rain': 'lluvia ligera',
    'moderate rain': 'lluvia moderada',
    'thunderstorm': 'tormenta',
    'snow': 'nieve',
    'mist': 'niebla',
    'fog': 'niebla',
    'haze': 'bruma',
  }

  const load = async () => {
    if (!zip) {
      setCity(globalCity || '')
      setDesc('')
      setTemp(null)
      return
    }
    try {
      const res = await fetch(`/api/weather?zip=${encodeURIComponent(zip)}&lang=${encodeURIComponent(language)}`, { cache: 'no-store' }).catch(()=>null)
      if (!res ||!res.ok) return
      const data = await res.json()
      let t_data: any = data?.temp?? data?.main?.temp?? null
      if (t_data!== null) {
        if (t_data > 150) t_data = (t_data - 273.15) * 9/5 + 32
        setTemp(Math.round(Number(t_data)))
      }
      const rawDescription = (data?.description || data?.weather?.[0]?.description || '').toLowerCase()

      if (rawDescription) {
        if (language!== 'en') {
          try {
            const tr = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: language, texts: [rawDescription] }),
              cache: 'no-store'
            })
            const translated = await tr.json().catch(() => null)
            const translatedText = translated?.translations?.[0]?.text || translated?.[0] || ''
            if (translatedText && translatedText.toLowerCase()!== rawDescription) {
              setDesc(translatedText)
            } else {
              // Fallback to manual map if API returns same English
              setDesc(weatherMap[rawDescription] || rawDescription)
            }
          } catch {
            setDesc(weatherMap[rawDescription] || rawDescription)
          }
        } else {
          setDesc(rawDescription)
        }
      }
      setCity(data?.city || data?.name || globalCity || '')
    } catch {}
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 300000)
    return () => clearInterval(id)
  }, [zip, globalCity, language])

  const displayCity = city || globalCity || (zip? zip : (t?.common?.yourArea || 'tu área'))

  return (
    <div data-sss-live className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-white font-black text-xs tracking-widest">{t?.weather?.weather || 'Clima'}</span>
        <span className="bg-green-500 text-black px-2 py-0.5 rounded-full font-black text-xs">{t?.weather?.live || 'EN VIVO'}</span>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="text-white text-3xl font-black">{temp!== null? `${temp}°F` : '--°F'}</div>
        <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full truncate max-w-">{displayCity}</span>
      </div>
      {desc && <div className="text-white/60 text-xs mt-2 capitalize">{desc}</div>}
    </div>
  )
}
