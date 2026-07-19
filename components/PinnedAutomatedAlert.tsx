'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AlertRow = { id: string; message?: string; title?: string; body?: string; created_at?: string }

export function PinnedAutomatedAlert() {
  const [alert, setAlert] = useState<AlertRow | null>(null)
  const [internetAlert, setInternetAlert] = useState<string | null>(null)
  const [zip] = useState('95122')

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const run = async () => {
      // SAME TABLE AS EmergencyAlerts - unified!
      const { data } = await supabase.from('alerts').select('id,message,title,body,created_at').eq('is_active', true).eq('zip_code', '95122').order('created_at',{ascending:false}).limit(1)
      if(mounted && data && data.length > 0){
        setAlert(data[0] as any)
        return
      }
    }

    const fetchLive = async () => {
      try {
        const res = await fetch(`https://api.weather.gov/alerts/active?point=37.3361,-121.8111`, {
          headers: { 'Accept': 'application/geo+json' }
        })
        const json = await res.json()
        if(mounted && json.features && json.features.length > 0){
          const headline = json.features[0].properties?.headline || json.features[0].properties?.event
          setInternetAlert(headline)
        }
      } catch {}
    }

    run()
    fetchLive()
    const id = setInterval(()=>{ run(); fetchLive() }, 15*60*1000)
    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  const text = alert?.message || alert?.title || alert?.body

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold flex items-center gap-2">📌 PINNED ALERT</p>
      {text? (
        <>
          <p className="text-sm mt-2 text-white/90 line-clamp-3">{text}</p>
          <p className="text-xs mt-2 text-white/50">{alert?.created_at? new Date(alert.created_at).toLocaleString() : ''} • {zip} • Live</p>
        </>
      ) : internetAlert? (
        <>
          <p className="text-sm mt-2 text-white/90 line-clamp-3">{internetAlert}</p>
          <p className="text-xs mt-2 text-white/50">Live • NWS • {zip}</p>
        </>
      ) : (
        <p className="text-sm mt-2 text-white/80">No emergencies in {zip}</p>
      )}
    </div>
  )
}

export default PinnedAutomatedAlert
