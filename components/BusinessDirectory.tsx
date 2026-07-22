'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

type Biz = { id: string; name: string; category: string | null }

export function BusinessDirectory(){
  const { zip, lat, lng } = useLocation()
  const [biz, setBiz] = useState<Biz[]>([])
  const [liveBiz, setLiveBiz] = useState<Biz[]>([])

  useEffect(()=>{
    if (!zip) return
    const supabase = createClient()
    let mounted = true

    const fetchLiveBusinesses = async () => {
      try {
        // GLOBAL FIX: use real lat/lng, not hardcoded 95122
        const useLat = lat || 37.7749
        const useLng = lng || -122.4194
        const query = `[out:json][timeout:25];(node(around:10000,${useLat},${useLng})[shop];way(around:10000,${useLat},${useLng})[shop];node(around:10000,${useLat},${useLng})[amenity=restaurant];);out 10;`
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

    supabase.from('businesses').select('id,name,category').eq('zip_code', zip).order('verified',{ascending:false}).limit(4).then(({data})=>{
      if(mounted && data && data.length > 0){
        setBiz(data as any)
      } else {
        fetchLiveBusinesses()
      }
    })

    const id = setInterval(()=>{
      supabase.from('businesses').select('id,name,category').eq('zip_code', zip).order('verified',{ascending:false}).limit(4).then(({data})=>{
        if(mounted && data && data.length > 0) setBiz(data as any)
      })
    }, 20*60*1000)

    return ()=>{ mounted = false; clearInterval(id) }
  },[zip, lat, lng])

  const display = biz.length > 0 ? biz : liveBiz

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🏢 Local Businesses</p>
      <p className="text-xs text-white/50">Loading location...</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🏢 Local Businesses</p>
      <p className="text-xs text-white/50 mt-1">Near {zip} • Live</p>
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
