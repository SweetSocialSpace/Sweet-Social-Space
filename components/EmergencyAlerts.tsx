'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

type Alert = { id: string; message?: string; event?: string; title?: string; body?: string; type?: string; icon?: string; latitude?: number | null; longitude?: number | null }

export function EmergencyAlerts() {
  const { zip: globalZip } = useLocation()
  const { filter } = useLocationScope()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [status, setStatus] = useState<'checking'|'clear'|'alert'>('checking')
  const [zip, setZip] = useState('')

  useEffect(()=>{
    if (!globalZip) return
    setZip(globalZip)
    let mounted = true
    const load = async()=>{
      try{
        const currentZip = globalZip
        const supabase = createClient() as any
        
        let data: any[] = []
        
        // Use radius-based filtering if user has coordinates
        if (filter.lat != null && filter.lng != null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          
          const { data: alertData } = await supabase
            .from('alerts')
            .select('id,message,event,title,body,latitude,longitude')
            .eq('is_active', true)
            .gte('latitude', bbox.minLat)
            .lte('latitude', bbox.maxLat)
            .gte('longitude', bbox.minLng)
            .lte('longitude', bbox.maxLng)
            .limit(10)
          
          if (alertData) {
            // Apply precise radius filtering
            data = applyScope(alertData, filter)
          }
        } else {
          // Fallback to zip-based filtering if no coordinates
          const { data: alertData, count } = await supabase.from('alerts').select('id,message,event,title,body', {count:'exact'}).eq('is_active', true).eq('zip_code', currentZip).limit(3)
          if (count && count > 0) {
            data = alertData || []
          }
        }
        
        if(mounted && data.length > 0){ setAlerts(data); setStatus('alert'); return }
        const res = await fetch(`/api/emergency?zip=${currentZip}`)
        const json = await res.json()
        if(mounted && json.alerts && json.alerts.length > 0){ if(json.alerts.length === 1 && json.alerts[0].type === 'Status'){ setAlerts(json.alerts); setStatus('clear') } else { setAlerts(json.alerts); setStatus('alert') } } else { if(mounted) setStatus('clear') }
      }catch(e){ try { console.log(e) } catch {}; if(mounted) setStatus('clear') }
    }
    load()
    const id = setInterval(()=>{ try { load() } catch {} }, 5*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[globalZip, filter])

  if (!globalZip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🚨 Emergency • Loading location...</p></div>)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold flex items-center gap-2">🚨 Emergency • Near {zip}</p>
      {status === 'checking' && <p className="text-sm mt-2 text-white/60 animate-pulse">Scanning NOAA, OpenWeather, USGS...</p>}
      {status === 'clear' && (<div className="mt-2">{alerts.map(a=> (<p key={a.id} className="text-sm text-white/80 bg-white/5 rounded-lg p-2.5">{(a as any).icon} {a.title} - {a.message}</p>))}{alerts.length===0 && <p className="text-sm mt-1 text-white/80">All clear in {zip} • No active alerts</p>}</div>)}
      {status === 'alert' && (<div className="mt-3 space-y-2">{alerts.map(a=> (<div key={a.id} className="text-sm bg-red-500/15 border border-red-500/30 rounded-lg p-2.5"><div className="font-black text-red-200 text-xs">{(a as any).icon || '🚨'} {a.title || a.event} {a.type? `• ${a.type}` : ''}</div><div className="text-white/80 mt-1 text-xs leading-snug">{a.message || a.body}</div></div>))}<p className="text-xs text-white/30 mt-2">Auto-refresh 5m • Weather & Safety APIs</p></div>)}
    </div>
  )
}
export default EmergencyAlerts
