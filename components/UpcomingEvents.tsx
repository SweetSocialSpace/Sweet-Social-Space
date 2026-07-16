'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Ev = { id: string; title: string; starts_at: string | null }

export function UpcomingEvents(){
  const [evs, setEvs] = useState<Ev[]>([])
  useEffect(()=>{
    const supabase = createClient()
    supabase.from('events').select('id,title,starts_at').gte('starts_at', new Date().toISOString()).order('starts_at').limit(4).then(({data})=>{ if(data) setEvs(data as any) })
  },[])
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📅 Upcoming Events</p>
      {evs.length===0? <p className="text-sm mt-3 text-white/60">No events nearby</p> : (
        <div className="mt-3 space-y-2">
          {evs.map(e=>(
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
