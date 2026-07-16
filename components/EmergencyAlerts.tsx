'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Alert = { id: string; message?: string; event?: string }

export function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [status, setStatus] = useState<'checking'|'clear'|'alert'>('checking')

    useEffect(()=>{
    const supabase = createClient()
    const load = async()=>{
      try{
        const {count} = await supabase.from('alerts').select('id',{count:'exact',head:true}).eq('is_active', true)
        setStatus(count&&count>0?'alert':'clear')
      }catch{
        setStatus('clear')
      }
    }
    load()
  },[])
    

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold flex items-center gap-2">🚨 Emergency</p>
      {status === 'checking' && <p className="text-sm mt-1 text-white/60">Checking...</p>}
      {status === 'clear' && <p className="text-sm mt-1 text-white/80">All clear</p>}
      {status === 'alert' && (
        <div className="mt-2 space-y-1">
          {alerts.map(a=> <p key={a.id} className="text-sm text-red-200">• {a.message || a.event}</p>)}
        </div>
      )}
    </div>
  )
}
