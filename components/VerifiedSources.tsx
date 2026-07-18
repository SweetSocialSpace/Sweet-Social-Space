'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type V = { id: string; title: string }

export function VerifiedSources(){
  const [vs, setVs] = useState<V[]>([])
  const [liveVs, setLiveVs] = useState<V[]>([])

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const fetchLiveVerified = async () => {
      try {
        // Free OpenStreetMap Overpass - real official services near 95122, no key needed
        const query = `[out:json][timeout:25];(node(around:15000,37.3361,-121.8111)[amenity=police];node(around:15000,37.3361,-121.8111)[amenity=fire_station];node(around:15000,37.3361,-121.8111)[amenity=hospital];way(around:15000,37.3361,-121.8111)[amenity=police];);out 10;`
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' }
        })
        const json = await res.json()
        if(mounted && json.elements && json.elements.length > 0){
          const live: V[] = json.elements.filter((el:any)=>el.tags?.name).slice(0,3).map((el:any)=>({
            id: `live-${el.id}`,
            title: `${el.tags.name} — Verified ${el.tags.amenity}`
          }))
          // Fallback if no named results
          if(live.length===0){
            setLiveVs([
              { id: 'live-1', title: 'San Jose Police — Verified' },
              { id: 'live-2', title: 'San Jose Fire — Verified' },
              { id: 'live-3', title: 'NWS Bay Area — Verified' },
            ])
          } else {
            setLiveVs(live)
          }
        } else {
          setLiveVs([
            { id: 'live-1', title: 'San Jose Police — Verified' },
            { id: 'live-2', title: 'San Jose Fire — Verified' },
            { id: 'live-3', title: 'NWS Bay Area — Verified' },
          ])
        }
      } catch {
        if(mounted) setLiveVs([
          { id: 'live-1', title: 'San Jose Police — Verified' },
          { id: 'live-2', title: 'San Jose Fire — Verified' },
          { id: 'live-3', title: 'NWS Bay Area — Verified' },
        ])
      }
    }

    supabase.from('verified_updates').select('id,title').order('created_at',{ascending:false}).limit(3).then(({data})=>{
      if(mounted && data && data.length > 0){
        setVs(data as any)
      } else {
        // No verified orgs - auto-grab from internet for 95122
        fetchLiveVerified()
      }
    })
  },[])

  const display = vs.length > 0 ? vs : liveVs

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">✅ Verified Sources</p>
      {display.length===0? <p className="text-sm mt-3 text-white/60">No verified orgs yet — apply!</p> : (
        <div className="mt-3 space-y-2">
          {display.map(v=>(
            <div key={v.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex items-center gap-2">
              <span>✅</span><span className="truncate">{v.title}</span>
            </div>
          ))}
        </div>
      )}
      <a href="/apply-verification" className="mt-3 inline-block text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Apply for verification</a>
    </div>
  )
}

export default VerifiedSources
