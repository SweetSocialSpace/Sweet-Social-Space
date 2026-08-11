'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'

type Alert = { id: string; title?: string; body?: string; severity?: string; created_at: string; latitude?: number | null; longitude?: number | null }

function timeAgo(iso:string){ try { const s = Math.floor((Date.now()-new Date(iso).getTime())/1000); if(s<60) return 'Just now'; const m=Math.floor(s/60); if(m<60) return `${m}m ago`; const h=Math.floor(m/60); if(h<24) return `${h}h ago`; return `${Math.floor(h/24)}d ago` } catch { return '' } }

export function LatestAlerts(){
  const { zip, lat, lng } = useLocation()
  const { filter } = useLocationScope()
  const [alerts, setAlerts]=useState<Alert[]>([])
  const [loading, setLoading]=useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true; let ch: any = null; let intervalId: any = null
    const load = async()=>{
      try {
        const supabase = createClient() as any
        let data: any[] = []
        
        // Use radius-based filtering if user has coordinates
        if (filter.lat != null && filter.lng != null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          
          const { data: alertData } = await supabase
            .from('alerts')
            .select('*')
            .eq('is_active', true)
            .gte('latitude', bbox.minLat)
            .lte('latitude', bbox.maxLat)
            .gte('longitude', bbox.minLng)
            .lte('longitude', bbox.maxLng)
            .order('created_at',{ascending:false})
            .limit(10)
          
          if (alertData) {
            // Apply precise radius filtering
            data = applyScope(alertData, filter)
          }
        } else {
          // Fallback to zip-based filtering if no coordinates
          const { data: alertData } = await supabase.from('alerts').select('*').eq('is_active', true).eq('zip_code', zip).order('created_at',{ascending:false}).limit(5)
          data = alertData || []
        }
        
        if(mounted && data.length > 0){ setAlerts(data); setLoading(false); return }
        
        // Global weather alert fallback - skip US-only NWS API for global compatibility
        // Note: For global weather alerts, consider integrating a global weather alert service
        // Current implementation uses database alerts only for global compatibility
        if(mounted) setLoading(false)
      } catch { if(mounted) setLoading(false) }
    }
    const setup = async()=>{
      try {
        const supabase = createClient() as any
        // Subscribe to all alerts changes, will filter client-side
        ch = supabase.channel(`latest-alerts-${zip}`).on('postgres_changes',{event:'*',schema:'public',table:'alerts'}, load).subscribe()
      } catch {}
    }
    load(); setup()
    intervalId = setInterval(()=>{ try { load() } catch {} }, 15*60*1000)
    return ()=>{ mounted = false; try { if (ch) { const supabase = createClient() as any; supabase.removeChannel(ch) } } catch {}; try { clearInterval(intervalId) } catch {} }
  },[zip, lat, lng, filter])

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">⚠ Latest Alerts</p><p className="text-sm mt-2 text-white/60">Loading location...</p></div>)
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">⚠ Latest Alerts • {zip}</p>
      {loading? <p className="text-sm mt-2 text-white/60">Loading...</p> : alerts.length===0? (<p className="text-sm mt-2 text-white/80">✅ All clear — no active alerts</p>) : (<div className="mt-3 space-y-3">{alerts.map(a=>(<div key={a.id} className="border-b border-white/10 pb-2 last:border-0 last:pb-0"><p className="text-sm font-semibold truncate">{a.title || 'Alert'}</p>{a.body && <p className="text-xs text-white/70 line-clamp-2 mt-1">{a.body}</p>}<p className="text-xs text-white/40 mt-1">🕒 {timeAgo(a.created_at)} {a.severity? `• ${a.severity}`:''}</p></div>))}</div>)}
    </div>
  )
}
export default LatestAlerts
