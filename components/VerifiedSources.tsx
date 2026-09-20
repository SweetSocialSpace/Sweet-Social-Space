'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'

type V = { id: string; title: string }

export function VerifiedSources(){
  const { zip, city } = useLocation()
  const t = useTranslations() as any
  const [liveVs, setLiveVs] = useState<V[]>([])

  useEffect(()=>{
    if (!zip) return

    let mounted = true
    const CACHE_KEY = `verified_${zip}_v1`
    const CACHE_TIME_KEY = `verified_${zip}_v1_time`

    const fetchLiveVerified = async () => {
      try {
        if (zip=== 'GLOBAL') {
          if(mounted) setLiveVs([
            { id: 'live-1', title: t?.verified?.trustNetwork },
            { id: 'live-2', title: t?.verified?.communitySafety },
            { id: 'live-3', title: t?.verified?.nws },
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
          { id: 'vs-1', title: `${displayCity} ${t?.verified?.policeDept} - ${t?.verified?.verified}` },
          { id: 'vs-2', title: `${displayCity} ${t?.verified?.fireDept} - ${t?.verified?.verified}` },
          { id: 'vs-3', title: t?.verified?.nws },
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
          { id: 'vs-1', title: `${city || t?.common?.yourArea} ${t?.verified?.police} - ${t?.verified?.verified}` },
          { id: 'vs-2', title: `${city || t?.common?.yourArea} ${t?.verified?.fire} - ${t?.verified?.verified}` },
          { id: 'vs-3', title: t?.verified?.nws },
        ])
      }
    }

    fetchLiveVerified()
  },[zip, city, t])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{t?.verified?.verifiedSources}</p>
      <p className="text-xs text-white/50">{t?.common?.loading}</p>
    </div>
  )

  const displayZip = zip=== 'GLOBAL' ? t?.common?.yourArea : zip

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">{t?.verified?.verifiedSources} - {t?.verified?.near} {displayZip}</p>
      {liveVs.length===0? <p className="text-sm mt-3 text-white/60">{t?.verified?.noVerifiedOrgs}</p> : (
        <div className="mt-3 space-y-2">
          {liveVs.map(v=>(
            <div key={v.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex items-center gap-2">
              <span>{t?.verified?.verifiedBadge}</span><span className="truncate">{v.title}</span>
            </div>
          ))}
        </div>
      )}
      <a href="/apply-verification" className="mt-3 inline-block text-xs bg-white text-black px-3 py-1 rounded-full font-bold">{t?.verified?.applyForVerification}</a>
    </div>
  )
}

export default VerifiedSources
