'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useTranslations, tFormat } from '@/lib/translations'

type EventItem = { id: string; title: string; venue?: string; icon?: string; source?: string }

export function WhatsHappeningNearYou(){
  const { zip, city, lat, lng } = useLocation()
  const t = useTranslations() as any
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  // Translate API titles that come in English — keeps zip dynamic
  const translateEventTitle = (title: string): string => {
    if (!title) return title
    // Keep zip dynamic — don't hardcode 95122
    const zipToUse = zip || ''

    // Map English API titles to Spanish using translations if available
    const titleMap: Record<string, string> = {
      [`Live Music near ${zipToUse}`]: t?.whatsHappening?.liveMusicNear? tFormat(t.whatsHappening.liveMusicNear, { zip: zipToUse }) : `Música en Vivo cerca de ${zipToUse}`,
      [`Local Market near ${zipToUse}`]: t?.whatsHappening?.localMarketNear? tFormat(t.whatsHappening.localMarketNear, { zip: zipToUse }) : `Mercado Local cerca de ${zipToUse}`,
      [`Community Event`]: t?.whatsHappening?.communityEvent || 'Evento Comunitario',
      [`Community Events in ${city || ''}, CA`]: t?.whatsHappening?.communityEventsIn? tFormat(t.whatsHappening.communityEventsIn, { city: city || '' }) : `Eventos Comunitarios en ${city || zipToUse}, CA`,
      [`Local Sports in ${city || ''}, CA`]: t?.whatsHappening?.localSportsIn? tFormat(t.whatsHappening.localSportsIn, { city: city || '' }) : `Deportes Locales en ${city || zipToUse}, CA`,
    }

    // Check for exact match first
    if (titleMap[title]) return titleMap[title]

    // Check for pattern matches (API might return variations)
    if (title.includes('Live Music near')) return t?.whatsHappening?.liveMusicNear? tFormat(t.whatsHappening.liveMusicNear, { zip: zipToUse }) : `Música en Vivo cerca de ${zipToUse}`
    if (title.includes('Local Market near')) return t?.whatsHappening?.localMarketNear? tFormat(t.whatsHappening.localMarketNear, { zip: zipToUse }) : `Mercado Local cerca de ${zipToUse}`
    if (title.includes('Community Event')) return t?.whatsHappening?.communityEvent || 'Evento Comunitario'
    if (title.includes('Community Events in')) return t?.whatsHappening?.communityEventsIn? tFormat(t.whatsHappening.communityEventsIn, { city: city || zipToUse }) : `Eventos Comunitarios en ${city || zipToUse}, CA`
    if (title.includes('Local Sports in')) return t?.whatsHappening?.localSportsIn? tFormat(t.whatsHappening.localSportsIn, { city: city || zipToUse }) : `Deportes Locales en ${city || zipToUse}, CA`
    if (title.includes('Events in')) return t?.whatsHappening?.eventsIn? tFormat(t.whatsHappening.eventsIn, { city: city || zipToUse }) : `Eventos en ${city || zipToUse}`

    return title
  }

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const load = async()=>{
      try{
        setLoading(true)

        const res = await fetch(`/api/events?zip=${encodeURIComponent(zip)}&lat=${lat}&lon=${lng}`)
        if (res.ok) {
          const json = await res.json()
          if(mounted) {
            const translated = (json.events || []).slice(0,5).map((ev: EventItem) => ({
             ...ev,
              title: translateEventTitle(ev.title)
            }))
            setEvents(translated)
            setLoading(false)
          }
        }

        const extRes = await fetch(`/api/external-events?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}&lat=${lat}&lon=${lng}`)
        if (extRes.ok) {
          const json = await extRes.json()
          if(mounted && json.events && json.events.length > 0) {
            const translatedExt = json.events.map((ev: EventItem) => ({
             ...ev,
              title: translateEventTitle(ev.title)
            }))
            setEvents((prev: EventItem[]) => [...prev,...translatedExt].slice(0,5))
          }
        }

        if(mounted) setLoading(false)
      }catch{
        if(mounted) {
          setEvents([
            { id: 'fallback-1', title: t?.whatsHappening?.eventsIn? tFormat(t.whatsHappening.eventsIn, { city: city || zip }) : `Eventos en ${city || zip}`, icon: '🎉', source: t?.whatsHappening?.local || 'Local' },
          ])
          setLoading(false)
        }
      }
    }
    load()
    const id = setInterval(load, 30*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, lat, lng, t])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {t?.whatsHappening?.whatsHappeningNearYou || "Qué pasa cerca de ti"}</p>
      <p className="text-xs text-white/50 mt-1">{t?.whatsHappening?.locating || 'Localizando...'}</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {t?.whatsHappening?.whatsHappeningNearYou || "Qué pasa cerca de ti"}</p>
      <p className="text-xs text-white/50 mt-1">{t?.whatsHappening?.near || 'Cerca de'} {zip} {city? `• ${city}`:''} • {t?.whatsHappening?.informationHighway || 'Autopista de Información'}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{t?.common?.loading || 'Cargando...'}</p> : events.length===0? (
        <p className="text-sm mt-3 text-white/70">{t?.whatsHappening?.checking || 'Verificando'} {city || zip} {t?.whatsHappening?.events || 'eventos...'}</p>
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
          <p className="text-xs text-white/25 mt-1">{t?.whatsHappening?.liveApis || 'En vivo: SeatGeek + APIs externas • Radio de 15 millas'}</p>
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
