'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  es: { what:"Que pasa cerca de ti", near:"Cerca de", locating:"Localizando...", loading:"Cargando...", checking:"Revisando", eventsIn:"Eventos en", infoHighway:"Autopista de informacion", live:"En vivo: SeatGeek + APIs externas • radio 15mi" },
  fr: { what:"Que se passe-t-il pres de vous", near:"Pres de", locating:"Localisation...", loading:"Chargement...", checking:"Verification de", eventsIn:"Evenements a", infoHighway:"Autoroute d'information", live:"Live: SeatGeek + APIs externes • rayon 15mi" },
  de: { what:"Was passiert in deiner Nahe", near:"Nahe", locating:"Orte...", loading:"Laden...", checking:"Prufe", eventsIn:"Events in", infoHighway:"Informations-Highway", live:"Live: SeatGeek + Externe APIs • 15mi Radius" },
  zh: { what:"你附近发生了什么", near:"靠近", locating:"定位中...", loading:"加载中...", checking:"正在检查", eventsIn:"活动在", infoHighway:"信息高速", live:"实时：SeatGeek + 外部API • 15英里半径" },
  ja: { what:"あなたの近くで何が起きているか", near:"付近", locating:"特定中...", loading:"読み込み中...", checking:"確認中", eventsIn:"イベント in", infoHighway:"情報ハイウェイ", live:"ライブ: SeatGeek + 外部API • 15マイル圏内" },
  ko: { what:"근처에서 무슨 일이", near:"근처", locating:"위치 확인중...", loading:"로딩중...", checking:"확인중", eventsIn:"이벤트", infoHighway:"정보 고속도로", live:"라이브: SeatGeek + 외부 API • 15마일 반경" },
  pt: { what:"O que esta acontecendo perto de voce", near:"Perto de", locating:"Localizando...", loading:"Carregando...", checking:"Verificando", eventsIn:"Eventos em", infoHighway:"Rodovia da informacao", live:"Ao vivo: SeatGeek + APIs externas • raio 15mi" },
  it: { what:"Cosa succede vicino a te", near:"Vicino a", locating:"Localizzazione...", loading:"Caricamento...", checking:"Controllo", eventsIn:"Eventi a", infoHighway:"Autostrada informazione", live:"Live: SeatGeek + API esterne • raggio 15mi" },
  nl: { what:"Wat gebeurt er bij jou in de buurt", near:"Bij", locating:"Lokaliseren...", loading:"Laden...", checking:"Controleren", eventsIn:"Evenementen in", infoHighway:"Informatiesnelweg", live:"Live: SeatGeek + Externe APIs • 15mi straal" },
  id: { what:"Apa yang terjadi di dekatmu", near:"Dekat", locating:"Mencari lokasi...", loading:"Memuat...", checking:"Memeriksa", eventsIn:"Acara di", infoHighway:"Jalan Tol Informasi", live:"Live: SeatGeek + API Eksternal • radius 15mi" },
  vi: { what:"Dieu gi dang dien ra gan ban", near:"Gan", locating:"Dang dinh vi...", loading:"Dang tai...", checking:"Dang kiem tra", eventsIn:"Su kien tai", infoHighway:"Duong cao toc thong tin", live:"Truc tiep: SeatGeek + API ngoai • ban kinh 15mi" },
  sv: { what:"Vad hander nara dig", near:"Nara", locating:"Lokaliserar...", loading:"Laddar...", checking:"Kollar", eventsIn:"Evenemang i", infoHighway:"Informationsmotorvag", live:"Live: SeatGeek + Externa API:er • 15mi radie" },
  pl: { what:"Co dzieje sie w poblizu", near:"Blisko", locating:"Lokalizowanie...", loading:"Ladowanie...", checking:"Sprawdzanie", eventsIn:"Wydarzenia w", infoHighway:"Autostrada informacji", live:"Na zywo: SeatGeek + Zewnetrzne API • promien 15mi" },
  tr: { what:"Yakininda neler oluyor", near:"Yakininda", locating:"Konum bulunuyor...", loading:"Yukleniyor...", checking:"Kontrol ediliyor", eventsIn:"Etkinlikler", infoHighway:"Bilgi Otoyolu", live:"Canli: SeatGeek + Harici APIler • 15mi yariçap" },
  ms: { what:"Apa berlaku berhampiran anda", near:"Dekat", locating:"Mengesan...", loading:"Memuat...", checking:"Memeriksa", eventsIn:"Acara di", infoHighway:"Lebuhraya Maklumat", live:"Live: SeatGeek + API Luaran • jejari 15mi" },
  ro: { what:"Ce se intampla langa tine", near:"Langa", locating:"Localizare...", loading:"Se incarca...", checking:"Se verifica", eventsIn:"Evenimente in", infoHighway:"Autostrada informatiei", live:"Live: SeatGeek + API externe • raza 15mi" },
  cs: { what:"Co se deje ve vasem okoli", near:"Blizko", locating:"Lokalizace...", loading:"Nacitani...", checking:"Kontrola", eventsIn:"Udalosti v", infoHighway:"Informacni dalnice", live:"Live: SeatGeek + Externi API • polomer 15mi" },
  hu: { what:"Mi tortenik a kozelben", near:"Kozeleben", locating:"Helymeghatarozas...", loading:"Betoltes...", checking:"Ellenorzes", eventsIn:"Esemenyek", infoHighway:"Informacios sztrada", live:"Elo: SeatGeek + Kulso API-k • 15mi sugar" },
  fi: { what:"Mita lahellasi tapahtuu", near:"Lahella", locating:"Paikannetaan...", loading:"Ladataan...", checking:"Tarkistetaan", eventsIn:"Tapahtumat kohteessa", infoHighway:"Tietovayla", live:"Live: SeatGeek + Ulkoiset API:t • 15mi sade" },
  no: { what:"Hva skjer i naerheten av deg", near:"Naer", locating:"Lokaliserer...", loading:"Laster...", checking:"Sjekker", eventsIn:"Arrangementer i", infoHighway:"Informasjonshoyvei", live:"Live: SeatGeek + Eksterne APIer • 15mi radius" },
  da: { what:"Hvad sker der i naerheden af dig", near:"Naer", locating:"Lokaliserer...", loading:"Indlaeser...", checking:"Tjekker", eventsIn:"Begivenheder i", infoHighway:"Informationsmotorvej", live:"Live: SeatGeek + Eksterne APIer • 15mi radius" },
  hr: { what:"Sto se dogada u vasoj blizini", near:"Blizu", locating:"Lociranje...", loading:"Ucitavanje...", checking:"Provjera", eventsIn:"Dogadaji u", infoHighway:"Informacijska autocesta", live:"Uzivo: SeatGeek + Vanjski API-ji • 15mi radijus" },
  sk: { what:"Co sa deje vo vasom okoli", near:"Blizko", locating:"Lokalizacia...", loading:"Nacitanie...", checking:"Kontrola", eventsIn:"Udalosti v", infoHighway:"Informacna dialnica", live:"Live: SeatGeek + Externe API • polomer 15mi" },
  sl: { what:"Kaj se dogaja v blizini", near:"Blizu", locating:"Lociranje...", loading:"Nalaganje...", checking:"Preverjanje", eventsIn:"Dogodki v", infoHighway:"Informacijska avtocesta", live:"V zivo: SeatGeek + Zunanji API-ji • 15mi radij" },
  et: { what:"Mis sinu lahedal toimub", near:"Lahedal", locating:"Asukoha maaramine...", loading:"Laadimine...", checking:"Kontrollimine", eventsIn:"Sundmused asukohas", infoHighway:"Infokiirtee", live:"Live: SeatGeek + Valised API-d • 15mi raadius" },
  az: { what:"Yaxinliqda neler bas verir", near:"Yaxininda", locating:"Yerlesir...", loading:"Yuklenir...", checking:"Yoxlanir", eventsIn:"Tedbirler", infoHighway:"Melumat magistrali", live:"Canli: SeatGeek + Xarici API • 15mi radius" },
  uz: { what:"Yaqiningizda nima sodir bolmoqda", near:"Yaqinida", locating:"Joylashuv...", loading:"Yuklanmoqda...", checking:"Tekshirilmoqda", eventsIn:"Tadbirlar", infoHighway:"Axborot magistrali", live:"Jonli: SeatGeek + Tashqi API • 15mi radius" },
  bg: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  bn: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  th: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  el: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  he: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  ur: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  fa: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  sr: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  lv: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  lt: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  be: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  ka: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  hy: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  kk: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  ky: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  tg: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  mn: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  km: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  lo: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
  my: { what:"What's happening near you", near:"Near", locating:"Locating...", loading:"Loading...", checking:"Checking", eventsIn:"Events in", infoHighway:"Information Highway", live:"Live: SeatGeek + External APIs • 15mi radius" },
}

type EventItem = { id: string; title: string; venue?: string; icon?: string; source?: string }

export function WhatsHappeningNearYou(){
  const { zip, city, lat, lng } = useLocation()
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const load = async()=>{
      try{
        setLoading(true)
        const res = await fetch(`/api/events?zip=${encodeURIComponent(zip)}&lat=${lat}&lon=${lng}`)
        if (res.ok) {
          const json = await res.json()
          if(mounted) { setEvents((json.events || []).slice(0,5)); setLoading(false) }
        }
        const extRes = await fetch(`/api/external-events?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}&lat=${lat}&lon=${lng}`)
        if (extRes.ok) {
          const json = await extRes.json()
          if(mounted && json.events && json.events.length > 0) {
            setEvents((prev: EventItem[]) => [...prev, ...json.events].slice(0,5))
          }
        }
        if(mounted) setLoading(false)
      }catch{ 
        if(mounted) {
          setEvents([{ id: 'fallback-1', title: `${d.eventsIn} ${city || zip}`, icon: '🎉', source: 'Local' }])
          setLoading(false)
        }
      }
    }
    load()
    const id = setInterval(load, 30*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, lat, lng, d])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {d.what}</p>
      <p className="text-xs text-white/50 mt-1">{d.locating}</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {d.what}</p>
      <p className="text-xs text-white/50 mt-1">{d.near} {zip} {city? `• ${city}`:''} • {d.infoHighway}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{d.loading}</p> : events.length===0? (
        <p className="text-sm mt-3 text-white/70">{d.checking} {city || zip} events...</p>
      ):(
        <div className="mt-3 space-y-2.5">
          {events.map(ev=>(
            <div key={ev.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition">
              <p className="text-sm font-bold text-white/90 line-clamp-2">{ev.icon || '🎉'} {ev.title}</p>
              <div className="flex gap-2 mt-1.5">
                {ev.venue && <p className="text-xs text-white/50">{ev.venue}</p>}
                {ev.source && <p className="text-xs text-white/30">• {ev.source}</p>}
              </div>
            </div>
          ))}
          <p className="text-xs text-white/25 mt-1">{d.live}</p>
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
