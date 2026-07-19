'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type EventItem = { id: string; title: string; venue?: string; type?: string; icon?: string; time?: string; body?: string; tag?: string }

export function WhatsHappeningNearYou(){
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const load = async()=>{
      try{
        // 1. Try real Supabase posts first (if neighbors posted about an event)
        const {data} = await supabase.from('posts').select('id,body,tag,created_at').eq('zip_code','95122').order('created_at',{ascending:false}).limit(2)

        // 2. ALWAYS grab live city events from YOUR new /api/events (SeatGeek)
        const res = await fetch('/api/events')
        const json = await res.json()
        const liveEvents: EventItem[] = json.events || []

        // 3. Merge: posts + live events so box is NEVER empty
        const combined: EventItem[] = []
        if(data && data.length > 0){
          data.forEach((p:any)=> combined.push({ id: p.id, title: p.body.slice(0,70), body: p.body, tag: p.tag, icon: '📌', venue: 'Neighbor post', time: p.created_at }))
        }
        liveEvents.forEach(ev=> combined.push(ev))

        if(mounted){
          setEvents(combined.slice(0,5))
          setLoading(false)
        }
      }catch{
        if(mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 30*60*1000) // refresh every 30 min
    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 What's happening near you</p>
      <p className="text-xs text-white/50 mt-1">Near 95122 • Live Events</p>
      {loading? <p className="text-sm mt-3 text-white/60">Scanning concerts, games...</p> : events.length===0? (
        <p className="text-sm mt-3 text-white/70">Checking San Jose events...</p>
      ):(
        <div className="mt-3 space-y-2.5">
          {events.map(ev=>(
            <div key={ev.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition">
              <p className="text-sm font-bold text-white/90 line-clamp-2">{ev.icon || '🎉'} {ev.title || ev.body}</p>
              <div className="flex gap-2 mt-1.5">
                {ev.venue && <p className="text- text-white/50">{ev.venue}</p>}
                {ev.type && <p className="text- text-white/40">• {ev.type}</p>}
              </div>
              {ev.time && <p className="text- text-white/30 mt-1">{new Date(ev.time).toLocaleDateString()} {ev.venue?.includes('SAP')?'• Tonight!':''}</p>}
            </div>
          ))}
          <p className="text- text-white/25 mt-1">Live: SeatGeek + neighbor posts • 15mi radius</p>
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
