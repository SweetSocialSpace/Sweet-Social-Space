'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Alert = { id: string; title?: string; body?: string; severity?: string; created_at: string }

function timeAgo(iso:string){
  const s = Math.floor((Date.now()-new Date(iso).getTime())/1000)
  if(s<60) return 'Just now'
  const m=Math.floor(s/60); if(m<60) return `${m}m ago`
  const h=Math.floor(m/60); if(h<24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export function LatestAlerts(){
  const [alerts][setAlerts]=useState<Alert[]>([])
  const [loading][setLoading]=useState(true)

  useEffect(()=>{
    const supabase = createClient()
    const load = async()=>{
      const {data}= await supabase.from('alerts').select('*').order('created_at',{ascending:false}).limit(5)
      if(data) setAlerts(data as any)
      setLoading(false)
    }
    load()
    const ch = supabase.channel('latest-alerts').on('postgres_changes',{event:'*',schema:'public',table:'alerts'}, load).subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  },[])

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">⚠️ Latest Alerts</p>
      {loading? <p className="text-sm mt-2 text-white/60">Loading...</p> : alerts.length===0? (
        <p className="text-sm mt-2 text-white/80">✅ All clear — no active alerts</p>
      ) : (
        <div className="mt-3 space-y-3">
          {alerts.map(a=>(
            <div key={a.id} className="border-b border-white/10 pb-2 last:border-0 last:pb-0">
              <p className="text-sm font-semibold truncate">{a.title || 'Alert'}</p>
              {a.body && <p className="text-xs text-white/70 line-clamp-2 mt-1">{a.body}</p>}
              <p className="text- text-white/40 mt-1">🕒 {timeAgo(a.created_at)} {a.severity? `• ${a.severity}`:''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LatestAlerts
