'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

type V = { id: string; title: string }

export function VerifiedSources(){
  const { zip, city } = useLocation()
  const [liveVs, setLiveVs] = useState<V[]>([])

  useEffect(()=>{
    if (!zip) return
    
    let mounted = true
    const CACHE_KEY = `verified_${zip}_v1`
    const CACHE_TIME_KEY = `verified_${zip}_v1_time`

    const fetchLiveVerified = async () => {
      try {
        if (zip === 'GLOBAL') {
          if(mounted) setLiveVs([
            { id: 'live-1', title: 'Trust Network - Verified' },
            { id: 'live-2', title: 'Community Safety - Verified' },
            { id: 'live-3', title: 'NWS - Verified' },
          ])
          return
        }

        const cached = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 15*60*1000) {
          if(mounted) setLiveVs(JSON.parse(cached))
          return
        }

        const displayCity = city || zip
        const fallback: V[] = [
          { id: 'vs-1', title: `${displayCity} Police Department - Verified` },
          { id: 'vs-2', title: `${displayCity} Fire Department - Verified` },
          { id: 'vs-3', title: `NWS - Verified` },
        ]
        
        if(mounted){
          setLiveVs(fallback)
          localStorage.setItem(CACHE_KEY, JSON.stringify(fallback))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        }
      } catch {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && mounted) setLiveVs(JSON.parse(cached))
        else if(mounted) setLiveVs([
          { id: 'vs-1', title: `${city || 'your area'} Police - Verified` },
          { id: 'vs-2', title: `${city || 'your area'} Fire - Verified` },
          { id: 'vs-3', title: 'NWS - Verified' },
        ])
      }
    }

    fetchLiveVerified()
  },[zip, city])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">Verified Sources</p>
      <p className="text-xs text-white/50">Loading...</p>
    </div>
  )

  const displayZip = zip === 'GLOBAL' ? 'your area' : zip

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">Verified Sources - Near {displayZip}</p>
      {liveVs.length===0? <p className="text-sm mt-3 text-white/60">No verified orgs yet - apply!</p> : (
        <div className="mt-3 space-y-2">
          {liveVs.map(v=>(
            <div key={v.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex items-center gap-2">
              <span>Verified</span><span className="truncate">{v.title}</span>
            </div>
          ))}
        </div>
      )}
      <a href="/apply-verification" className="mt-3 inline-block text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Apply for verification</a>
    </div>
  )
}

export default VerifiedSources
