'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  es: { upcoming:"Proximos eventos", near:"Cerca de", noEvents:"Sin eventos cercanos", loading:"Cargando...", tba:"Por confirmar" },
  fr: { upcoming:"Evenements a venir", near:"Pres de", noEvents:"Pas d'evenements proches", loading:"Chargement...", tba:"A definir" },
  de: { upcoming:"Anstehende Events", near:"Nahe", noEvents:"Keine Events in der Nahe", loading:"Laden...", tba:"Noch offen" },
  zh: { upcoming:"即将到来的活动", near:"靠近", noEvents:"附近暂无活动", loading:"加载中...", tba:"待定" },
  ja: { upcoming:"今後のイベント", near:"付近", noEvents:"近くにイベントなし", loading:"読み込み中...", tba:"未定" },
  ko: { upcoming:"다가오는 이벤트", near:"근처", noEvents:"근처 이벤트 없음", loading:"로딩중...", tba:"미정" },
  pt: { upcoming:"Proximos eventos", near:"Perto de", noEvents:"Nenhum evento proximo", loading:"Carregando...", tba:"A definir" },
  ru: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  ar: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  hi: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  it: { upcoming:"Eventi imminenti", near:"Vicino a", noEvents:"Nessun evento vicino", loading:"Caricamento...", tba:"Da definire" },
  nl: { upcoming:"Aankomende evenementen", near:"Bij", noEvents:"Geen evenementen in de buurt", loading:"Laden...", tba:"Nog te bepalen" },
  tl: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  bn: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  id: { upcoming:"Acara mendatang", near:"Dekat", noEvents:"Tidak ada acara terdekat", loading:"Memuat...", tba:"TBA" },
  vi: { upcoming:"Su kien sap toi", near:"Gan", noEvents:"Khong co su kien gan day", loading:"Dang tai...", tba:"Chua xac dinh" },
  th: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  sv: { upcoming:"Kommande evenemang", near:"Nara", noEvents:"Inga evenemang i narheten", loading:"Laddar...", tba:"Ej bestamt" },
  pl: { upcoming:"Nadchodzace wydarzenia", near:"Blisko", noEvents:"Brak wydarzen w poblizu", loading:"Ladowanie...", tba:"Do ustalenia" },
  tr: { upcoming:"Yaklasan etkinlikler", near:"Yakininda", noEvents:"Yakinlarda etkinlik yok", loading:"Yukleniyor...", tba:"Belirlenecek" },
  uk: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  el: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  he: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  ur: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  fa: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  ms: { upcoming:"Acara akan datang", near:"Dekat", noEvents:"Tiada acara berdekatan", loading:"Memuat...", tba:"TBA" },
  ro: { upcoming:"Evenimente viitoare", near:"Langa", noEvents:"Niciun eveniment in apropiere", loading:"Se incarca...", tba:"De stabilit" },
  cs: { upcoming:"Nadchazejici udalosti", near:"Blizko", noEvents:"Zadne udalosti v blizkosti", loading:"Nacitani...", tba:"Bude upresneno" },
  hu: { upcoming:"Kozelgo esemenyek", near:"Kozeleben", noEvents:"Nincs kozeli esemeny", loading:"Betoltes...", tba:"Meghatarozatlan" },
  fi: { upcoming:"Tulevat tapahtumat", near:"Lahella", noEvents:"Ei tapahtumia lahella", loading:"Ladataan...", tba:"Ilmoitetaan myohemmin" },
  no: { upcoming:"Kommende arrangementer", near:"Naer", noEvents:"Ingen arrangementer i naerheten", loading:"Laster...", tba:"TBA" },
  da: { upcoming:"Kommende begivenheder", near:"Naer", noEvents:"Ingen begivenheder i naerheden", loading:"Indlaeser...", tba:"TBA" },
  bg: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  hr: { upcoming:"Nadolazeci dogadaji", near:"Blizu", noEvents:"Nema dogadaja u blizini", loading:"Ucitavanje...", tba:"TBA" },
  sr: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  sk: { upcoming:"Nadchadzajuce udalosti", near:"Blizko", noEvents:"Ziadne udalosti v blizkosti", loading:"Nacitanie...", tba:"Bude upresnene" },
  sl: { upcoming:"Prihajajoci dogodki", near:"Blizu", noEvents:"Ni dogodkov v blizini", loading:"Nalaganje...", tba:"Se doloci" },
  et: { upcoming:"Tulevased sundmused", near:"Lahedal", noEvents:"Laheduses sundmusi pole", loading:"Laadimine...", tba:"Maaratlemata" },
  lv: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  lt: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  be: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  ka: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  hy: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  az: { upcoming:"Gelecek tedbirler", near:"Yaxininda", noEvents:"Yaxinliqda tedbir yoxdur", loading:"Yuklenir...", tba:"TBA" },
  kk: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  ky: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  uz: { upcoming:"Yaqinlashib kelayotgan tadbirlar", near:"Yaqinida", noEvents:"Yaqin atrofda tadbir yoq", loading:"Yuklanmoqda...", tba:"TBA" },
  tg: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  mn: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  km: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  lo: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
  my: { upcoming:"Upcoming Events", near:"Near", noEvents:"No events nearby", loading:"Loading...", tba:"TBA" },
}

type Ev = { id: string; title: string; starts_at: string | null; latitude?: number | null; longitude?: number | null }

export function UpcomingEvents(){
  const { zip, country_code } = useLocation() as any
  const { filter } = useLocationScope()
  const { language } = useLanguage()
  const t = D[language] || D.en
  const [evs, setEvs] = useState<Ev[]>([])
  const [liveEvs, setLiveEvs] = useState<Ev[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const fetchEvents = useCallback(async (signal?: AbortSignal) => {
    const supabase = createClient() as any
    try {
      let data: any[] = []
      if (filter.lat != null && filter.lng != null) {
        const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
        const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
        const { data: eventData } = await supabase.from('events').select('id,title,starts_at,latitude,longitude').gte('starts_at', new Date().toISOString()).gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat).gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng).order('starts_at').limit(10)
        if (eventData) data = applyScope(eventData, filter)
      } else {
        const { data: eventData } = await supabase.from('events').select('id,title,starts_at').eq('zip_code', zip).gte('starts_at', new Date().toISOString()).order('starts_at').limit(4)
        data = eventData || []
      }
      if (signal?.aborted) return null
      return data
    } catch { return null }
  }, [zip, filter])

  const fetchLiveEvents = useCallback(async (signal?: AbortSignal) => {
    try {
      const cc = String((country_code || '')).toUpperCase()
      if (!cc) return []
      const res = await fetch(`https://date.nager.at/api/v3/NextPublicHolidays/${encodeURIComponent(cc)}`, { signal })
      if (!res.ok) return []
      const json = await res.json()
      if (!Array.isArray(json) || json.length === 0) return []
      return json.slice(0,4).map((h:any)=>({ id: `live-${h.date}-${h.localName}`, title: `${h.localName} — ${h.name}`, starts_at: h.date }))
    } catch { return [] }
  }, [country_code])

  useEffect(()=>{
    if (!zip) return
    const controller = new AbortController()
    abortRef.current = controller
    const load = async () => {
      const data = await fetchEvents(controller.signal)
      if (controller.signal.aborted) return
      if (data && data.length > 0) setEvs(data)
      else {
        const live = await fetchLiveEvents(controller.signal)
        if (!controller.signal.aborted) setLiveEvs(live)
      }
    }
    load()
    const id = setInterval(load, 30*60*1000)
    return ()=>{ controller.abort(); clearInterval(id) }
  }, [zip, fetchEvents, fetchLiveEvents])

  const display = evs.length > 0 ? evs : liveEvs

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📅 {t.upcoming}</p>
      <p className="text-xs text-white/50">{t.loading}</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📅 {t.upcoming}</p>
      <p className="text-xs text-white/50 mt-1">{t.near} {zip}</p>
      {display.length===0? <p className="text-sm mt-3 text-white/60">{t.noEvents}</p> : (
        <div className="mt-3 space-y-2">
          {display.map(e=>(
            <div key={e.id} className="bg-white/5 rounded-xl p-2.5 text-xs">
              <p className="font-semibold truncate">{e.title}</p>
              <p className="text-white/40 text-xs mt-1">{e.starts_at? new Date(e.starts_at).toLocaleDateString() : t.tba}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UpcomingEvents
