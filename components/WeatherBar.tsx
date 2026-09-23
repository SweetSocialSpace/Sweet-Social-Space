'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

const D: Record<string, string> = {
  en: "your area", es: "tu area", fr: "votre zone", de: "dein Bereich", zh: "你的区域", ja: "あなたのエリア", ko: "당신의 지역", pt: "sua area", ru: "your area", ar: "your area", hi: "your area",
  it: "tua zona", nl: "jouw gebied", tl: "your area", bn: "your area", id: "area Anda", vi: "khu vuc cua ban", th: "your area", sv: "ditt omrade", pl: "twoj obszar", tr: "bolgeniz", uk: "your area", el: "your area", he: "your area", ur: "your area", fa: "your area",
  ms: "kawasan anda", ro: "zona ta", cs: "vase oblast", hu: "a kornyeked", fi: "alueesi", no: "ditt omrade", da: "dit omrade", bg: "your area", hr: "vase podrucje", sr: "your area", sk: "vasa oblast", sl: "vase obmocje", et: "sinu piirkond", lv: "your area", lt: "your area", be: "your area", ka: "your area", hy: "your area",
  az: "eraziniz", kk: "your area", ky: "your area", uz: "hududingiz", tg: "your area", mn: "your area", km: "your area", lo: "your area", my: "your area",
}

export default function WeatherBar() {
  const { zip: globalZip, city: globalCity } = useLocation()
  const { language } = useLanguage()
  const t = useTranslations()
  const zip = globalZip && globalZip!== 'YOUR NEIGHBORHOOD'? globalZip : ''
  const [temp, setTemp] = useState<number | null>(null)
  const [desc, setDesc] = useState('')
  const [city, setCity] = useState('')
  const yourArea = D[language] || D.en

  const load = async () => {
    if (!zip) {
      setCity(globalCity || '')
      setDesc('')
      setTemp(null)
      return
    }
    try {
      const res = await fetch(`/api/weather?zip=${encodeURIComponent(zip)}&lang=${language}`, { cache: 'no-store' }).catch(()=>null)
      if (!res ||!res.ok) return
      const data = await res.json()
      let t_data: any = data?.temp?? data?.main?.temp?? null
      if (t_data!== null) {
        if (t_data > 150) t_data = (t_data - 273.15) * 9/5 + 32
        setTemp(Math.round(Number(t_data)))
      }
      setDesc((data?.description || data?.weather?.[0]?.description || '').toLowerCase())
      setCity(data?.city || data?.name || globalCity || '')
    } catch {}
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 300000)
    return () => clearInterval(id)
  }, [zip, globalCity, language])

  const displayCity = city || globalCity || (zip? zip : yourArea)

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-white font-black text-xs tracking-widest">{t.weather?.weather || 'WEATHER'}</span>
        <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-full font-black">{t.weather?.live || 'LIVE'}</span>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="text-white text-3xl font-black">{temp!== null? `${temp}°F` : '--°F'}</div>
        <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full truncate max-w-[120px]">{displayCity}</span>
      </div>
      {desc && <div className="text-white/60 text-xs mt-2 capitalize">{desc}</div>}
    </div>
  )
}
