'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'

type Biz = { id: string; name: string; category: string | null; latitude?: number | null; longitude?: number | null }

export function BusinessDirectory(){
  const { zip, city } = useLocation()
  const { filter } = useLocationScope()
  const [biz, setBiz] = useState<Biz[]>([])
  const [liveBiz, setLiveBiz] = useState<Biz[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!zip) return
    
    let mounted = true
    const CACHE_KEY = `biz_${zip}_v1`
    const CACHE_TIME_KEY = `biz_${zip}_v1_time`

    const fetchLiveBusinesses = async () => {
      if (!mounted) return
      setLoading(true)
      
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 15*60*1000) {
          if(mounted){
            setLiveBiz(JSON.parse(cached))
            setLoading(false)
          }
          return
        }

        const displayCity = city || zip
        const fallback: Biz[] = [
          { id: 'fb-1', name: `${displayCity} Police Department`, category: 'Police' },
          { id: 'fb-2', name: `${displayCity} Fire Department`, category: 'Fire Station' },
          { id: 'fb-3', name: `${displayCity} Library`, category: 'Library' },
          { id: 'fb-4', name: `${displayCity} Community Center`, category: 'Community' },
        ]
        
        if(mounted){
          setLiveBiz(fallback)
          localStorage.setItem(CACHE_KEY, JSON.stringify(fallback))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        }
      } catch (e){
        console.log('Business directory error:', e)
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && mounted) setLiveBiz(JSON.parse(cached))
      } finally {
        if(mounted) setLoading(false)
      }
    }

    const load = async () => {
      try {
        const supabase = createClient() as any
        let data: any[] = []
        
        // Use radius-based filtering if user has coordinates
        if (filter.lat != null && filter.lng != null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          
          const { data: bizData } = await supabase
            .from('businesses')
            .select('id,name,category,latitude,longitude')
            .gte('latitude', bbox.minLat)
            .lte('latitude', bbox.maxLat)
            .gte('longitude', bbox.minLng)
            .lte('longitude', bbox.maxLng)
            .order('verified',{ascending:false})
            .limit(10)
          
          if (bizData) {
            // Apply precise radius filtering
            data = applyScope(bizData, filter)
          }
        } else {
          // Fallback to zip-based filtering if no coordinates
          const { data: bizData } = await supabase.from('businesses').select('id,name,category').eq('zip_code', zip).order('verified',{ascending:false}).limit(4)
          data = bizData || []
        }
        
        if(mounted && data.length > 0){ 
          setBiz(data) 
        } else { 
          fetchLiveBusinesses() 
        }
      } catch { 
        if(mounted) fetchLiveBusinesses() 
      }
    }
    
    load()
    
    const id = setInterval(()=>{ 
      if(mounted) {
        try { load() } catch {} 
      }
    }, 20*60*1000)
    
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, filter])

  const display = biz.length > 0 ? biz : liveBiz
  const displayArea = zip === 'GLOBAL' || !zip ? (city || 'your area') : zip

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">Local Businesses</p><p className="text-xs text-white/50">Loading {displayArea}...</p></div>)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">Local Businesses</p>
      <p className="text-xs text-white/50 mt-1">Near {displayArea}</p>
      {loading ? <p className="text-sm mt-3 text-white/60">Loading...</p> : 
      display.length===0? <p className="text-sm mt-3 text-white/60">No businesses yet</p> : 
      (<div className="mt-3 space-y-2">{display.map(b=>(<div key={b.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex justify-between"><span className="truncate">{b.name}</span><span className="text-white/40">{b.category||''}</span></div>))}</div>)}
    </div>
  )
}
export default BusinessDirectory
