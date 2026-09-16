'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

type EventItem = { id: string; title: string; venue?: string; icon?: string; source?: string; _origTitle?: string; _origVenue?: string }

export function WhatsHappeningNearYou(){
  const { zip, city, lat, lng } = useLocation()
  const { language } = useLanguage()
  const isEs = language?.toLowerCase().startsWith('es')
  const t = useTranslations() as any
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const load = async()=>{
      try{
        setLoading(true)
        let all: EventItem[] = []

        const res = await fetch(`/api/events?zip=${encodeURIComponent(zip)}&lat=${lat}&lon=${lng}`)
        if (res.ok) {
          const json = await res.json()
          all = (json.events || []).slice(0,5)
        }
        
        const extRes = await fetch(`/api/external-events?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}&lat=${lat}&lon=${lng}`)
        if (extRes.ok) {
          const json = await extRes.json()
          if (json.events?.length > 0) {
            all = [...all, ...json.events].slice(0,5)
          }
        }

        // AUTO-TRANSLATE event titles if Español tab
        if (isEs && all.length > 0) {
          try {
            const textsToTranslate = all.flatMap(ev => [ev.title, ev.venue].filter(Boolean)) as string[]
            if (textsToTranslate.length > 0) {
              const trRes = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: language, texts: textsToTranslate }),
              })
              if (trRes.ok) {
                const trData = await trRes.json()
                const translations: string[] = trData.translations?.map((x:any)=> x.text || x) || trData || []
                let idx = 0
                all = all.map(ev => {
                  const newTitle = translations[idx++] || ev.title
                  const newVenue = ev.venue ? (translations[idx++] || ev.venue) : ev.venue
                  return { ...ev, title: newTitle, venue: newVenue, _origTitle: ev.title, _origVenue: ev.venue }
                })
              }
            }
          } catch {}
        }

        if(mounted) {
          setEvents(all.length ? all : [
            { id: 'fallback-1', title: `${t?.whatsHappening?.eventsIn || (isEs? 'Eventos en' : 'Events in')} ${city || zip}`, icon: '🎉', source: t?.whatsHappening?.local || 'Local' },
          ])
          setLoading(false)
        }
      }catch{ 
        if(mounted) {
          setEvents([
            { id: 'fallback-1', title: `${t?.whatsHappening?.eventsIn || (isEs? 'Eventos en' : 'Events in')} ${city || zip}`, icon: '🎉', source: t?.whatsHappening?.local || 'Local' },
          ])
          setLoading(false)
        }
      }
    }
    load()
    const id = setInterval(load, 30*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, lat, lng, language, isEs])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {t?.whatsHappening?.whatsHappeningNearYou || (isEs? 'Qué pasa cerca de ti' : "What's happening near you")}</p>
      <p className="text-xs text-white/50 mt-1">{t?.whatsHappening?.locating || (isEs? 'Localizando...' : 'Locating...')}</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {t?.whatsHappening?.whatsHappeningNearYou || (isEs? 'Qué pasa cerca de ti' : "What's happening near you")}</p>
      <p className="text-xs text-white/50 mt-1">{t?.whatsHappening?.near || (isEs? 'Cerca de' : 'Near')} {zip} {city? `• ${city}`:''} • {t?.whatsHappening?.informationHighway || (isEs? 'Autopista de Información' : 'Information Highway')}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{t?.common?.loading || (isEs? 'Cargando...' : 'Loading...')}</p> : events.length===0? (
        <p className="text-sm mt-3 text-white/70">{t?.whatsHappening?.checking || (isEs? 'Revisando' : 'Checking')} {city || zip} {t?.whatsHappening?.events || (isEs? 'eventos...' : 'events...')}</p>
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
          <p className="text-xs text-white/25 mt-1">{t?.whatsHappening?.liveApis || (isEs? 'En vivo: SeatGeek + APIs externas • Radio 15 millas' : 'Live: SeatGeek + External APIs • 15mi radius')}</p>
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
