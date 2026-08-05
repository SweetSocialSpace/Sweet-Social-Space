'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

type V = { id: string; title: string }

export function VerifiedSources(){
  const { zip, lat, lng, city } = useLocation()
  const [liveVs, setLiveVs] = useState<V[]>([])

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    const CACHE_KEY = `verified_${zip}_v1`
    const CACHE_TIME_KEY = `verified_${zip}_v1_time`

    const fetchLiveVerified = async () => {
      try {
        // GLOBAL = your area, no lat/lng search
        if (zip === 'GLOBAL') {
          if(mounted) setLiveVs([
            { id: 'live-1', title: `Global Trust Network — Verified` },
            { id: 'live-2', title: `Community Safety — Verified` },
            { id: 'live-3', title: `NWS — Verified` },
          ])
          return
        }

        // RULES: cache check 15min
        const cached = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 15*60*1000) {
          if(mounted) setLiveVs(JSON.parse(cached))
          return
        }

        let useLat = lat
        let useLng = lng
        
        // AUTOMATIC: Fetch coordinates from zip if not available
        if (!useLat || !useLng) {
          try {
            const geoRes = await fetch(`/api/zips?zip=${zip}`)
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              if (geoData.lat && geoData.lon) {
                useLat = parseFloat(geoData.lat)
                useLng = parseFloat(geoData.lon)
              }
            }
          } catch (e) {
            console.log('VerifiedSources: Failed to get coordinates from zip (non-critical):', e)
          }
        }
        
        // Validate coordinates are valid numbers and within reasonable ranges
        if (!useLat || !useLng || 
            isNaN(useLat) || isNaN(useLng) ||
            useLat < -90 || useLat > 90 ||
            useLng < -180 || useLng > 180 ||
            useLat === 0 || useLng === 0) {
          console.log('VerifiedSources: Invalid coordinates, using city fallback')
          const fallback = [
            { id: 'live-1', title: `${city || 'Local'} Police — Verified` },
            { id: 'live-2', title: `${city || 'Local'} Fire — Verified` },
            { id: 'live-3', title: `NWS — Verified` },
          ]
          if(mounted) setLiveVs(fallback)
          return
        }

        // RULES: stagger 3s so BusinessDirectory goes first - prevents 429
        await new Promise(r => setTimeout(r, 3000))

        const query = `[out:json][timeout:25];(node(around:15000,${useLat},${useLng})[amenity=police];node(around:15000,${useLat},${useLng})[amenity=fire_station];node(around:15000,${useLat},${useLng})[amenity=hospital];way(around:15000,${useLat},${useLng})[amenity=police]););out 10;`
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' }
        })

        if (res.status === 429 || res.status === 504 || res.status === 400) {
          console.warn('VerifiedSources Overpass returned error status (non-critical):', res.status)
          if (cached && mounted) setLiveVs(JSON.parse(cached))
          else if(mounted) setLiveVs([
            { id: 'live-1', title: `${city || 'your area'} Police — Verified` },
            { id: 'live-2', title: `${city || 'your area'} Fire — Verified` },
            { id: 'live-3', title: 'NWS — Verified` },
          ])
          return
        }

        if (!res.ok) throw new Error('overpass fail')
        const json = await res.json()
        let live: V[] = []
        if(json.elements && json.elements.length > 0){
          live = json.elements.filter((el:any)=>el.tags?.name).slice(0,3).map((el:any)=>({
            id: `live-${el.id}`,
            title: `${el.tags.name} — Verified ${el.tags.amenity}`
          }))
        }
        if(live.length===0){
          live = [
            { id: 'live-1', title: `${city || 'your area'} Police — Verified` },
            { id: 'live-2', title: `${city || 'your area'} Fire — Verified` },
            { id: 'live-3', title: 'NWS — Verified' },
          ]
        }
        if(mounted){
          setLiveVs(live)
          localStorage.setItem(CACHE_KEY, JSON.stringify(live))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        }
      } catch {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && mounted) setLiveVs(JSON.parse(cached))
        else if(mounted) setLiveVs([
          { id: 'live-1', title: `${city || 'your area'} Police — Verified` },
          { id: 'live-2', title: `${city || 'your area'} Fire — Verified` },
          { id: 'live-3', title: 'NWS — Verified' },
        ])
      }
    }

    fetchLiveVerified()
  },[zip, lat, lng, city])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">✅ Verified Sources</p>
      <p className="text-xs text-white/50">Loading...</p>
    </div>
  )

  const displayZip = zip === 'GLOBAL' ? 'your area' : zip

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">✅ Verified Sources • Near {displayZip}</p>
      {liveVs.length===0? <p className="text-sm mt-3 text-white/60">No verified orgs yet — apply!</p> : (
        <div className="mt-3 space-y-2">
          {liveVs.map(v=>(
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
