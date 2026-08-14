'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'

type EventItem = { id: string; title: string; venue?: string; icon?: string; source?: string }

export function WhatsHappeningNearYou(){
  const { zip, city, lat, lng } = useLocation()
  const t = useTranslations()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const load = async()=>{
      try{
        setLoading(true)
        
        // Use existing events API (already working)
        const res = await fetch(`/api/events?zip=${encodeURIComponent(zip)}&lat=${lat}&lon=${lng}`)
        if (res.ok) {
          const json = await res.json()
          if(mounted) {
            setEvents((json.events || []).slice(0,5))
            setLoading(false)
          }
        }
        
        // Also try external events API
        const extRes = await fetch(`/api/external-events?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}&lat=${lat}&lon=${lng}`)
        if (extRes.ok) {
          const json = await extRes.json()
          if(mounted && json.events && json.events.length > 0) {
            setEvents(prev => [...prev, ...json.events].slice(0,5))
          }
        }
        
        if(mounted) setLoading(false)
      }catch{ 
        if(mounted) {
          setEvents([
            { id: 'fallback-1', title: `Events in ${city || zip}`, icon: '🎉', source: 'Local' },
          ])
          setLoading(false)
        }
      }
    }
    load()
    const id = setInterval(load, 30*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, lat, lng])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {t.feed.whatsHappening} near you</p>
      <p className="text-xs text-white/50 mt-1">{t.location.locating}</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 {t.feed.whatsHappening} near you</p>
      <p className="text-xs text-white/50 mt-1">Near {zip} {city? `• ${city}`:''} • Information Highway</p>
      {loading? <p className="text-sm mt-3 text-white/60">{t.feed.loading}</p> : events.length===0? (
        <p className="text-sm mt-3 text-white/70">Checking {city || zip} events...</p>
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
          <p className="text-xs text-white/25 mt-1">Live: SeatGeek + External APIs • 15mi radius</p>
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
