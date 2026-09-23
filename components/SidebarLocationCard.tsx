'use client'
import { useLocation } from '@/lib/location-context'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  es: { clearSky:"cielo despejado", noEmerg:"Sin emergencias", alerts:"alertas", online:"en linea", live:"EN VIVO", global:"GLOBAL" },
  fr: { clearSky:"ciel clair", noEmerg:"Pas d'urgences", alerts:"alertes", online:"en ligne", live:"DIRECT", global:"GLOBAL" },
  de: { clearSky:"klarer Himmel", noEmerg:"Keine Notfalle", alerts:"Alarme", online:"online", live:"LIVE", global:"GLOBAL" },
  zh: { clearSky:"晴空", noEmerg:"无紧急情况", alerts:"警报", online:"在线", live:"实时", global:"全球" },
  ja: { clearSky:"晴天", noEmerg:"緊急事態なし", alerts:"アラート", online:"オンライン", live:"ライブ", global:"グローバル" },
  ko: { clearSky:"맑은 하늘", noEmerg:"긴급 상황 없음", alerts:"알림", online:"온라인", live:"라이브", global:"글로벌" },
  pt: { clearSky:"ceu limpo", noEmerg:"Sem emergencias", alerts:"alertas", online:"online", live:"AO VIVO", global:"GLOBAL" },
  ru: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  ar: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  hi: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  it: { clearSky:"cielo sereno", noEmerg:"Nessuna emergenza", alerts:"allerte", online:"online", live:"LIVE", global:"GLOBALE" },
  nl: { clearSky:"heldere lucht", noEmerg:"Geen noodgevallen", alerts:"meldingen", online:"online", live:"LIVE", global:"GLOBAAL" },
  tl: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  bn: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  id: { clearSky:"langit cerah", noEmerg:"Tidak ada darurat", alerts:"peringatan", online:"online", live:"LIVE", global:"GLOBAL" },
  vi: { clearSky:"troi quang", noEmerg:"Khong co khan cap", alerts:"canh bao", online:"truc tuyen", live:"TRUC TIEP", global:"TOAN CAU" },
  th: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  sv: { clearSky:"klar himmel", noEmerg:"Inga nolagen", alerts:"larm", online:"online", live:"LIVE", global:"GLOBAL" },
  pl: { clearSky:"czyste niebo", noEmerg:"Brak zagrozen", alerts:"alerty", online:"online", live:"LIVE", global:"GLOBAL" },
  tr: { clearSky:"acik hava", noEmerg:"Acil durum yok", alerts:"uyarilar", online:"cevrimici", live:"CANLI", global:"GLOBAL" },
  uk: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  el: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  he: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  ur: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  fa: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  ms: { clearSky:"langit cerah", noEmerg:"Tiada kecemasan", alerts:"amaran", online:"dalam talian", live:"LIVE", global:"GLOBAL" },
  ro: { clearSky:"cer senin", noEmerg:"Nicio urgenta", alerts:"alerte", online:"online", live:"LIVE", global:"GLOBAL" },
  cs: { clearSky:"jasna obloha", noEmerg:"Zadne nouze", alerts:"upozorneni", online:"online", live:"ZIVE", global:"GLOBAL" },
  hu: { clearSky:"tiszta eg", noEmerg:"Nincs vészhelyzet", alerts:"riasztasok", online:"online", live:"ELO", global:"GLOBAL" },
  fi: { clearSky:"kirkas taivas", noEmerg:"Ei hatatiloja", alerts:"halytykset", online:"online", live:"LIVE", global:"GLOBAL" },
  no: { clearSky:"klar himmel", noEmerg:"Ingen nodsituasjoner", alerts:"varsler", online:"online", live:"LIVE", global:"GLOBAL" },
  da: { clearSky:"klar himmel", noEmerg:"Ingen nodsituationer", alerts:"alarmer", online:"online", live:"LIVE", global:"GLOBAL" },
  bg: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  hr: { clearSky:"vedro nebo", noEmerg:"Nema hitnih slucajeva", alerts:"upozorenja", online:"online", live:"UZIVO", global:"GLOBAL" },
  sr: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  sk: { clearSky:"jasna obloha", noEmerg:"Ziadne nudze", alerts:"upozornenia", online:"online", live:"NAZIVO", global:"GLOBAL" },
  sl: { clearSky:"jasno nebo", noEmerg:"Ni nujnih primerov", alerts:"opozorila", online:"online", live:"V ZIVO", global:"GLOBAL" },
  et: { clearSky:"selge taevas", noEmerg:"Hadaolukordi pole", alerts:"hoiatused", online:"online", live:"OTSE", global:"GLOBAL" },
  lv: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  lt: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  be: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  ka: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  hy: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  az: { clearSky:"aciq hava", noEmerg:"Tecili hal yoxdur", alerts:"xeberdarliqlar", online:"online", live:"CANLI", global:"GLOBAL" },
  kk: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  ky: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  uz: { clearSky:"ochiq osmon", noEmerg:"Favqulodda holat yoq", alerts:"ogohlantirishlar", online:"online", live:"JONLI", global:"GLOBAL" },
  tg: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  mn: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  km: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  lo: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
  my: { clearSky:"clear sky", noEmerg:"No emergencies", alerts:"alerts", online:"online", live:"LIVE", global:"GLOBAL" },
}

export default function SidebarLocationCard() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const t = D[language] || D.en
  const [weather, setWeather] = useState<any>(null)
  const [pulse, setPulse] = useState<any>(null)

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') return
    fetch(`/api/weather?zip=${zip}`).then(r=>r.json()).then(setWeather).catch(()=>{})
    fetch(`/api/pulse?zip=${zip}`).then(r=>r.json()).then(setPulse).catch(()=>{})
  }, [zip])

  const displayCity = (() => {
    if (!city) return zip
    return city
  })()

  const temp = weather?.temp? `${Math.round(weather.temp)}°` : ''
  const condition = weather?.condition || t.clearSky
  const online = pulse?.online?? 2
  const emergencies = pulse?.emergencies?? 0

  return (
    <div className="bg-white/[0.06] backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-black text-white text-sm tracking-wide">{zip === 'GLOBAL'? t.global : `${zip}, ${displayCity}`}</p>
          <p className="text-xs text-white/70 mt-1">{temp} {condition} • {online} {t.online}</p>
          <p className="text-[11px] text-white/40 mt-1">{emergencies === 0? `✓ ${t.noEmerg}` : `⚠ ${emergencies} ${t.alerts}`}</p>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${zip!== 'GLOBAL'? 'bg-green-500 text-black' : 'bg-white/10 text-white/30'}`}>{t.live}</span>
      </div>
    </div>
  )
}
