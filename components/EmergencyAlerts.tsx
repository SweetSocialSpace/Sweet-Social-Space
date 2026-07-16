'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Alert = { id: string; message?: string; event?: string; title?: string; body?: string }

export function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [status, setStatus] = useState<'checking'|'clear'|'alert'>('checking')

  useEffect(()=>{
    const supabase = createClient()
    const load = async()=>{
      try{
        const {data, count} = await supabase.from('alerts').select('id,message,event,title,body', {count:'exact'}).eq('is_active', true).limit(3)
        if(count && count>0){
          setAlerts((data as any) || [])
          setStatus('alert')
        }else{
          setStatus('clear')
        }
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
      {status === 'clear' && <p className="text-sm mt-1 text-white/80">All clear in 95122</p>}
      {status === 'alert' && (
        <div className="mt-2 space-y-2">
          {alerts.map(a=> (
            <p key={a.id} className="text-sm text-red-200 bg-red-500/10 rounded-lg p-2">
              • {a.message || a.event || a.title || a.body || 'Active alert'}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
export default EmergencyAlerts
