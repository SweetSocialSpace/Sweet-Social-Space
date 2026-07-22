'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

type Alert = { id: string; title?: string; body?: string; severity?: string; created_at: string }

function timeAgo(iso:string){
  const s = Math.floor((Date.now()-new Date(iso).getTime())/1000)
  if(s<60) return 'Just now'
  const m=Math.floor(s/60); if(m<60) return `${m}m ago`
  const h=Math.floor(m/60); if(h<24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export function LatestAlerts(){
  const { zip, lat, lng } = useLocation()
  const [alerts, setAlerts]=useState<Alert[]>([])
  const [loading, setLoading]=useState(true)

  useEffect(()=>{
    if (!zip) return // wait for real location
    const supabase = createClient()
    let mounted = true

    const fetchLive = async () => {
      try {
        // GLOBAL FIX: use real coords, not hardcoded 95122 coords
        const pointLat = lat || 37.7749
        const pointLng = lng || -122.4194
        const res = await fetch(`https://api.weather.gov/alerts/active?point=${pointLat},${pointLng}`, {
          headers: { 'Accept': 'application/geo+json' }
        })
        const json = await res.json()
        if(mounted && json.features && json.features.length > 0){
          const live: Alert[] = json.features.slice(0,5).map((f:any, i:number)=>({
            id: f.id || `live-${i}`,
            title: f.properties?.event || 'Live Alert',
            body: f.properties?.headline || f.properties?.description?.slice(0,120),
            severity: f.properties?.severity,
            created_at: f.properties?.sent || new Date().toISOString()
          }))
          setAlerts(live)
        }
      } catch {}
      if(mounted) setLoading(false)
    }

    const load = async()=>{
     const {data}= await supabase.from('alerts').select('*').eq('is_active', true).eq('zip_code', zip).order('created_at',{ascending:false}).limit(5)
      if(mounted && data && data.length > 0){
        setAlerts(data as any)
        setLoading(false)
      } else {
        // GLOBAL FIX: auto-grab for real zip, not 95122
        fetchLive()
      }
    }
    load()

    const ch = supabase.channel(`latest-alerts-${zip}`).on('postgres_changes',{event:'*',schema:'public',table:'alerts', filter:`zip_code=eq.${zip}`}, load).subscribe()
    const id = setInterval(load, 15*60*1000)

    return ()=>{ mounted = false; supabase.removeChannel(ch); clearInterval(id) }
  },[zip, lat, lng])

  if (!zip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">⚠ Latest Alerts</p>
      <p className="text-sm mt-2 text-white/60">Loading location...</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">⚠ Latest Alerts • {zip}</p>
      {loading? <p className="text-sm mt-2 text-white/60">Loading...</p> : alerts.length===0? (
        <p className="text-sm mt-2 text-white/80">✅ All clear — no active alerts</p>
      ) : (
        <div className="mt-3 space-y-3">
          {alerts.map(a=>(
            <div key={a.id} className="border-b border-white/10 pb-2 last:border-0 last:pb-0">
              <p className="text-sm font-semibold truncate">{a.title || 'Alert'}</p>
              {a.body && <p className="text-xs text-white/70 line-clamp-2 mt-1">{a.body}</p>}
              <p className="text-xs text-white/40 mt-1">🕒 {timeAgo(a.created_at)} {a.severity? `• ${a.severity}`:''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LatestAlerts
