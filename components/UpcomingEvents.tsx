'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Ev = { id: string; title: string; starts_at: string | null }

export function UpcomingEvents(){
  const [evs, setEvs] = useState<Ev[]>([])
  const [liveEvs, setLiveEvs] = useState<Ev[]>([])

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const fetchLiveEvents = async () => {
      try {
        // Free public holidays API - real upcoming events, no key needed
        const res = await fetch('https://date.nager.at/api/v3/NextPublicHolidays/US')
        const json = await res.json()
        if(mounted && Array.isArray(json) && json.length > 0){
          const live: Ev[] = json.slice(0,4).map((h:any)=>({
            id: `live-${h.date}-${h.localName}`,
            title: `${h.localName} — ${h.name}`,
            starts_at: h.date
          }))
          setLiveEvs(live)
        }
      } catch {}
    }

    supabase.from('events').select('id,title,starts_at').gte('starts_at', new Date().toISOString()).order('starts_at').limit(4).then(({data})=>{
      if(mounted && data && data.length > 0){
        setEvs(data as any)
      } else {
        // No events - auto-grab from internet
        fetchLiveEvents()
      }
    })

    const id = setInterval(()=>{
      supabase.from('events').select('id,title,starts_at').gte('starts_at', new Date().toISOString()).order('starts_at').limit(4).then(({data})=>{
        if(mounted && data && data.length > 0) setEvs(data as any)
      })
    }, 30*60*1000) // auto-refresh every 30 min

    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  const display = evs.length > 0? evs : liveEvs

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📅 Upcoming Events</p>
      <p className="text-xs text-white/50 mt-1">Near 95122 • Live</p>
      {display.length===0? <p className="text-sm mt-3 text-white/60">No events nearby</p> : (
        <div className="mt-3 space-y-2">
          {display.map(e=>(
            <div key={e.id} className="bg-white/5 rounded-xl p-2.5 text-xs">
              <p className="font-semibold truncate">{e.title}</p>
              <p className="text-white/40 text- mt-1">{e.starts_at? new Date(e.starts_at).toLocaleDateString() : 'TBA'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UpcomingEvents
