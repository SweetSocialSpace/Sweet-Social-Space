'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'

type Ev = { id: string; title: string; starts_at: string | null; latitude?: number | null; longitude?: number | null }

export function UpcomingEvents(){
  const { zip, country_code } = useLocation() as any
  const { filter } = useLocationScope()
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
        const { data: eventData } = await supabase
          .from('events')
          .select('id,title,starts_at,latitude,longitude')
          .gte('starts_at', new Date().toISOString())
          .gte('latitude', bbox.minLat).lte('latitude', bbox.maxLat)
          .gte('longitude', bbox.minLng).lte('longitude', bbox.maxLng)
          .order('starts_at').limit(10)
        if (eventData) data = applyScope(eventData, filter)
      } else {
        const { data: eventData } = await supabase.from('events')
          .select('id,title,starts_at')
          .eq('zip_code', zip)
          .gte('starts_at', new Date().toISOString())
          .order('starts_at').limit(4)
        data = eventData || []
      }
      if (signal?.aborted) return null
      return data
    } catch {
      return null
    }
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
    } catch {
      return []
    }
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

    return ()=>{
      controller.abort()
      clearInterval(id)
    }
  }, [zip, fetchEvents, fetchLiveEvents]) // <-- don't put the whole filter object, use the memoized callbacks

  const display = evs.length > 0 ? evs : liveEvs

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📅 Upcoming Events</p>
      <p className="text-xs text-white/50">Loading...</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📅 Upcoming Events</p>
      <p className="text-xs text-white/50 mt-1">Near {zip}</p>
      {display.length===0? <p className="text-sm mt-3 text-white/60">No events nearby</p> : (
        <div className="mt-3 space-y-2">
          {display.map(e=>(
            <div key={e.id} className="bg-white/5 rounded-xl p-2.5 text-xs">
              <p className="font-semibold truncate">{e.title}</p>
              <p className="text-white/40 text-xs mt-1">{e.starts_at? new Date(e.starts_at).toLocaleDateString() : 'TBA'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UpcomingEvents
