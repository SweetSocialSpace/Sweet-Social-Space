'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

const D: Record<string, string> = {
  en: "your area", 
  es: "tu zona", 
  fr: "votre zone", 
  de: "deine Gegend", 
  zh: "你的区域", 
  ja: "あなたのエリア", 
  ko: "당신의 지역", 
  pt: "sua região", 
  ru: "ваш район", 
  ar: "منطقتك", 
  hi: "आपका क्षेत्र",
  it: "la tua zona", 
  nl: "jouw omgeving", 
  tl: "iyong lugar", 
  bn: "আপনার এলাকা", 
  id: "wilayah Anda", 
  vi: "khu vực của bạn", 
  th: "พื้นที่ของคุณ", 
  sv: "ditt område", 
  pl: "twoja okolica", 
  tr: "bölgeniz", 
  uk: "ваш район", 
  el: "η περιοχή σου", 
  he: "האזור שלך", 
  ur: "آپ کا علاقہ", 
  fa: "منطقه شما",
  ms: "kawasan anda", 
  ro: "zona ta", 
  cs: "vaše oblast", 
  hu: "a környéked", 
  fi: "alueesi", 
  no: "ditt område", 
  da: "dit område", 
  bg: "вашия район", 
  hr: "vaše područje", 
  sr: "ваше подручје", 
  sk: "vaša oblasť", 
  sl: "vaše območje", 
  et: "sinu piirkond", 
  lv: "jūsu rajons", 
  lt: "jūsų rajonas", 
  be: "ваш раён", 
  ka: "თქვენი უბანი", 
  hy: "քո տարածքը",
  az: "əraziniz", 
  kk: "сіздің ауданыңыз", 
  ky: "сиздин аймак", 
  uz: "sizning hududingiz", 
  tg: "минтақаи шумо", 
  mn: "таны бүс", 
  km: "តំបន់របស់អ្នក", 
  lo: "ເຂດຂອງທ່ານ", 
  my: "သင့်ဧရိယာ",
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
