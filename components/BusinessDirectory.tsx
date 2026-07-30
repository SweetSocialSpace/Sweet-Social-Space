'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

type Biz = { id: string; name: string; category: string | null }

export function BusinessDirectory(){
  const { zip, lat, lng, city } = useLocation()
  const [biz, setBiz] = useState<Biz[]>([])
  const [liveBiz, setLiveBiz] = useState<Biz[]>([])

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const CACHE_KEY = `biz_${zip}_v1`
    const CACHE_TIME_KEY = `biz_${zip}_v1_time`

    const fetchLiveBusinesses = async () => {
      try {
        // RULES: cache 15min per zip - no hammering Overpass
        const cached = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 15*60*1000) {
          if(mounted){
            setLiveBiz(JSON.parse(cached))
          }
          return
        }

        const useLat = lat
        const useLng = lng
        if (!useLat || !useLng) return // RULES: no fallback to 37.7749 hardcoded SF - wait for real location
        
        const query = `[out:json][timeout:25];(node(around:10000,${useLat},${useLng})[shop];way(around:10000,${useLat},${useLng})[shop];node(around:10000,${useLat},${useLng})[amenity=restaurant];);out 10;`
        const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query, headers: { 'Content-Type': 'text/plain' } })
        
        if (res.status === 429) {
          console.warn('Overpass 429 - using cache')
          if (cached && mounted) setLiveBiz(JSON.parse(cached))
          return
        }
        if (!res.ok) throw new Error('overpass fail')
        
        const json = await res.json()
        if(mounted && json.elements && json.elements.length > 0){
          const places: Biz[] = json.elements.filter((el:any)=>el.tags?.name).slice(0,4).map((el:any)=>({ id: `live-${el.id}`, name: el.tags.name, category: el.tags.shop || el.tags.amenity || 'local' }))
          setLiveBiz(places)
          localStorage.setItem(CACHE_KEY, JSON.stringify(places))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        }
      } catch (e){
        // fallback to cache on any error
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && mounted) setLiveBiz(JSON.parse(cached))
      }
    }

    const load = async () => {
      try {
        const supabase = createClient() as any
        const {data} = await supabase.from('businesses').select('id,name,category').eq('zip_code', zip).order('verified',{ascending:false}).limit(4)
        if(mounted && data && data.length > 0){ setBiz(data as any) } else { fetchLiveBusinesses() }
      } catch { fetchLiveBusinesses() }
    }
    load()
    // RULES: no aggressive polling - 20min is okay with cache, but cache prevents API hit
    const id = setInterval(()=>{ try { load() } catch {} }, 20*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, lat, lng])

  const display = biz.length > 0 ? biz : liveBiz
  const displayArea = zip === 'GLOBAL' || !zip ? (city || 'your area') : zip

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🏢 Local Businesses</p><p className="text-xs text-white/50">Loading {displayArea}...</p></div>)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🏢 Local Businesses</p><p className="text-xs text-white/50 mt-1">Near {displayArea} • Live</p>{display.length===0? <p className="text-sm mt-3 text-white/60">No businesses yet</p> : (<div className="mt-3 space-y-2">{display.map(b=>(<div key={b.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex justify-between"><span className="truncate">{b.name}</span><span className="text-white/40">{b.category||''}</span></div>))}</div>)}</div>
  )
}
export default BusinessDirectory
