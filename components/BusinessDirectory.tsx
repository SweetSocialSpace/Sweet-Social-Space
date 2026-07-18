'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Biz = { id: string; name: string; category: string | null }

export function BusinessDirectory(){
  const [biz, setBiz] = useState<Biz[]>([])
  const [liveBiz, setLiveBiz] = useState<Biz[]>([])

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const fetchLiveBusinesses = async () => {
      try {
        // Free OpenStreetMap Overpass - real businesses near 95122, no key needed
        const query = `[out:json][timeout:25];(node(around:10000,37.3361,-121.8111)[shop];way(around:10000,37.3361,-121.8111)[shop];node(around:10000,37.3361,-121.8111)[amenity=restaurant];);out 10;`
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' }
        })
        const json = await res.json()
        if(mounted && json.elements && json.elements.length > 0){
          const places: Biz[] = json.elements.filter((el:any)=>el.tags?.name).slice(0,4).map((el:any)=>({
            id: `live-${el.id}`,
            name: el.tags.name,
            category: el.tags.shop || el.tags.amenity || 'local'
          }))
          setLiveBiz(places)
        }
      } catch {}
    }

    supabase.from('businesses').select('id,name,category').order('verified',{ascending:false}).limit(4).then(({data})=>{
      if(mounted && data && data.length > 0){
        setBiz(data as any)
      } else {
        // No businesses - auto-grab from internet for 95122
        fetchLiveBusinesses()
      }
    })

    const id = setInterval(()=>{
      supabase.from('businesses').select('id,name,category').order('verified',{ascending:false}).limit(4).then(({data})=>{
        if(mounted && data && data.length > 0) setBiz(data as any)
      })
    }, 20*60*1000) // auto-refresh every 20 min

    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  const display = biz.length > 0 ? biz : liveBiz

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🏢 Local Businesses</p>
      <p className="text-xs text-white/50 mt-1">Near 95122 • Live</p>
      {display.length===0? <p className="text-sm mt-3 text-white/60">No businesses yet</p> : (
        <div className="mt-3 space-y-2">
          {display.map(b=>(
            <div key={b.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex justify-between">
              <span className="truncate">{b.name}</span><span className="text-white/40">{b.category||''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessDirectory
