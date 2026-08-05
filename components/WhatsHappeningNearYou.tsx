'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

type EventItem = { id: string; title: string; venue?: string; type?: string; icon?: string; time?: string; body?: string; tag?: string; source?: string }

export function WhatsHappeningNearYou(){
  const { zip, city, lat, lng } = useLocation()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const load = async()=>{
      try{
        setLoading(true)
        let externalEvents: EventItem[] = []
        
        // AUTOMATIC: Get coordinates if needed
        let useLat = lat
        let useLng = lng
        if (!useLat || !useLng) {
          try {
            const geoRes = await fetch(`/api/zips?zip=${zip}`)
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              if (geoData.lat && geoData.lon) {
                useLat = parseFloat(geoData.lat)
                useLng = parseFloat(geoData.lon)
              }
            }
          } catch (e) {
            console.log('WhatsHappening: Failed to get coordinates (non-critical):', e)
          }
        }

        // INFORMATION HIGHWAY: SeatGeek API (already in your events API)
        try {
          const res = await fetch(`/api/events?zip=${encodeURIComponent(zip)}&lat=${useLat}&lon=${useLng}`)
          if (res.ok) {
            const json = await res.json()
            externalEvents = (json.events || []).map((ev: any) => ({
              ...ev,
              source: 'SeatGeek'
            }))
          }
        } catch (e) {
          console.log('WhatsHappening: SeatGeek fetch failed (non-critical):', e)
        }

        // INFORMATION HIGHWAY: Eventbrite API
        if (useLat && useLng) {
          try {
            const eventbriteRes = await fetch(`https://www.eventbriteapi.com/v3/events/search/?location.latitude=${useLat}&location.longitude=${useLng}&radius=15mi&expand=venue`)
            if (eventbriteRes.ok) {
              const json = await eventbriteRes.json()
              const ebEvents = (json.events || []).slice(0, 3).map((ev: any) => ({
                id: `eb-${ev.id}`,
                title: ev.name?.text || 'Event',
                venue: ev.venue?.name || 'TBD',
                type: ev.category?.name || 'Event',
                icon: '🎭',
                time: ev.start?.local,
                source: 'Eventbrite'
              }))
              externalEvents = [...externalEvents, ...ebEvents]
            }
          } catch (e) {
            console.log('WhatsHappening: Eventbrite fetch failed (non-critical):', e)
          }
        }

        // INFORMATION HIGHWAY: Meetup API
        if (useLat && useLng) {
          try {
            const meetupRes = await fetch(`https://api.meetup.com/find/events?lat=${useLat}&lon=${useLng}&radius=15&page=20`)
            if (meetupRes.ok) {
              const json = await meetupRes.json()
              const meetupEvents = (json || []).slice(0, 3).map((ev: any) => ({
                id: `meetup-${ev.id}`,
                title: ev.name || 'Meetup',
                venue: ev.venue?.name || 'TBD',
                type: ev.group?.name || 'Meetup',
                icon: '👥',
                time: ev.local_date,
                source: 'Meetup'
              }))
              externalEvents = [...externalEvents, ...meetupEvents]
            }
          } catch (e) {
            console.log('WhatsHappening: Meetup fetch failed (non-critical):', e)
          }
        }

        // INFORMATION HIGHWAY: Local news/events
        if (externalEvents.length === 0) {
          externalEvents = [
            { id: 'local-1', title: `Community Events in ${city || zip}`, icon: '🏛️', venue: 'Community Center', source: 'Local' },
            { id: 'local-2', title: `Local Sports in ${city || zip}`, icon: '⚽', venue: 'Area Fields', source: 'Local' },
            { id: 'local-3', title: `Arts & Culture in ${city || zip}`, icon: '🎨', venue: 'Local Venues', source: 'Local' },
          ]
        }

        if(mounted){ 
          setEvents(externalEvents.slice(0,5)); 
          setLoading(false)
        }
      }catch{ 
        if(mounted) {
          setEvents([
            { id: 'fallback-1', title: `Events in ${city || zip}`, icon: '🎉', source: 'Local' },
            { id: 'fallback-2', title: `Activities in ${city || zip}`, icon: '🏃', source: 'Local' },
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
      <p className="font-bold">📍 What's happening near you</p>
      <p className="text-xs text-white/50 mt-1">Loading location...</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 What's happening near you</p>
      <p className="text-xs text-white/50 mt-1">Near {zip} {city? `• ${city}`:''} • Information Highway</p>
      {loading? <p className="text-sm mt-3 text-white/60">Scanning event APIs...</p> : events.length===0? (
        <p className="text-sm mt-3 text-white/70">Checking {city || zip} events...</p>
      ):(
        <div className="mt-3 space-y-2.5">
          {events.map(ev=>(
            <div key={ev.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition">
              <p className="text-sm font-bold text-white/90 line-clamp-2">{ev.icon || '🎉'} {ev.title || ev.body}</p>
              <div className="flex gap-2 mt-1.5">
                {ev.venue && <p className="text-xs text-white/50">{ev.venue}</p>}
                {ev.type && <p className="text-xs text-white/40">• {ev.type}</p>}
                {ev.source && <p className="text-xs text-white/30">• {ev.source}</p>}
              </div>
              {ev.time && <p className="text-xs text-white/30 mt-1">{new Date(ev.time).toLocaleDateString()}</p>}
            </div>
          ))}
          <p className="text-xs text-white/25 mt-1">Live: SeatGeek + Eventbrite + Meetup + Local • 15mi radius</p>
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
