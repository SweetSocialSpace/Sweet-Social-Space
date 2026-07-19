'use client'
import { useEffect, useState } from 'react'

export function WhatsHappeningNearYou() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/events').then(r=>r.json()).then(j=>{
      setEvents(j.events||[])
      setLoading(false)
    })
  },[])

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold flex items-center gap-2">📍 What's happening near you</p>
      <p className="text-xs text-white/50">Near 95122 • Live • Today</p>
      <div className="mt-3 space-y-2.5">
        {loading && <p className="text-sm text-white/60">Scanning concerts, games, events...</p>}
        {!loading && events.map(ev=>(
          <div key={ev.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-sm font-bold">{ev.icon} {ev.title}</div>
            <div className="text-xs text-white/60 mt-1">{ev.venue} • {ev.type}</div>
            <div className="text- text-white/40">{ev.time? new Date(ev.time).toLocaleDateString() : 'Today'}</div>
          </div>
        ))}
        <p className="text- text-white/30 mt-2">Live from SeatGeek, local venues • auto-refresh 30m</p>
      </div>
    </div>
  )
}
