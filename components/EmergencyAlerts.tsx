'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

type LiveAlert = { id: string; message?: string; event?: string; title?: string; body?: string; type?: string; icon?: string }

export function EmergencyAlerts() {
  const { zip: globalZip } = useLocation()
  const [alerts, setAlerts] = useState<LiveAlert[]>([])
  const [status, setStatus] = useState<'checking'|'clear'|'alert'>('checking')
  const [zip, setZip] = useState('')

  useEffect(()=>{
    if (!globalZip) return // wait for real zip
    setZip(globalZip)
    const supabase = createClient()
    let mounted = true

    const load = async()=>{
      try{
        // GLOBAL FIX: use globalZip, no fallback to 95122
        const currentZip = globalZip

        // 1. Check Supabase manual alerts first
        const {data, count} = await supabase.from('alerts').select('id,message,event,title,body', {count:'exact'}).eq('is_active', true).eq('zip_code', currentZip).limit(3)
        if(mounted && count && count>0){
          setAlerts((data as any) || [])
          setStatus('alert')
          return
        }

        // 2. No manual alerts - hit OUR new auto-scanner
        const res = await fetch(`/api/emergency?zip=${currentZip}`)
        const json = await res.json()
        if(mounted && json.alerts && json.alerts.length > 0){
          if(json.alerts.length === 1 && json.alerts[0].type === 'Status'){
            setAlerts(json.alerts)
            setStatus('clear')
          } else {
            setAlerts(json.alerts)
            setStatus('alert')
          }
        } else {
          if(mounted) setStatus('clear')
        }
      }catch(e){
        console.log(e)
        if(mounted) setStatus('clear')
      }
    }
    load()
    const id = setInterval(load, 5*60*1000)
    return ()=>{ mounted = false; clearInterval(id) }
  },[globalZip])

  if (!globalZip) return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🚨 Emergency • Loading location...</p>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold flex items-center gap-2">🚨 Emergency • Near {zip} • Live</p>
      {status === 'checking' && <p className="text-sm mt-2 text-white/60 animate-pulse">Scanning NOAA, OpenWeather, USGS...</p>}
      {status === 'clear' && (
        <div className="mt-2">
          {alerts.map(a=> (
            <p key={a.id} className="text-sm text-white/80 bg-white/5 rounded-lg p-2.5">
              {(a as any).icon} {a.title} - {a.message}
            </p>
          ))}
          {alerts.length===0 && <p className="text-sm mt-1 text-white/80">All clear in {zip} • No active alerts</p>}
        </div>
      )}
      {status === 'alert' && (
        <div className="mt-3 space-y-2">
          {alerts.map(a=> (
            <div key={a.id} className="text-sm bg-red-500/15 border border-red-500/30 rounded-lg p-2.5">
              <div className="font-black text-red-200 text-xs">{(a as any).icon || '🚨'} {a.title || a.event} {a.type? `• ${a.type}` : ''}</div>
              <div className="text-white/80 mt-1 text-xs leading-snug">{a.message || a.body}</div>
            </div>
          ))}
          <p className="text-xs text-white/30 mt-2">Live from OpenWeather, NOAA, USGS • auto-refresh 5m</p>
        </div>
      )}
    </div>
  )
}
export default EmergencyAlerts
