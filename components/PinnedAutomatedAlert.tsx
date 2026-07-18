'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AlertPost = { id: string; body: string; tag: string | null; created_at: string }

export function PinnedAutomatedAlert() {
  const [alert, setAlert] = useState<AlertPost | null>(null)
  const [internetAlert, setInternetAlert] = useState<string | null>(null)
  const [zip, setZip] = useState('95122')

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const run = async () => {
      let activeZip = zip
      const { data: { user } } = await supabase.auth.getUser()
      if(user){
        const { data: prof } = await supabase.from('profiles').select('zip_code').eq('user_id', user.id).maybeSingle()
        if(prof?.zip_code) {
          activeZip = prof.zip_code
          if(mounted) setZip(activeZip)
        }
      }
      const since24 = new Date(Date.now() - 24*3600*1000).toISOString()
      const { data: bots } = await supabase.from('profiles').select('user_id').ilike('display_name','%bot%')
      const botIds = new Set((bots||[]).map((b:any)=>b.user_id))

      const { data: recent } = await supabase.from('posts').select('id,body,tag,created_at,user_id').eq('zip_code', activeZip).gte('created_at', since24).order('created_at',{ascending:false}).limit(20)
      const automated = (recent||[]).find((r:any)=>botIds.has(r.user_id)) as AlertPost | undefined
      if(mounted && automated) setAlert(automated)
    }

    const fetchLive = async () => {
      try {
        // Live NWS alerts for San Jose 95122 - no key needed
        const res = await fetch(`https://api.weather.gov/alerts/active?point=37.3361,-121.8111`, {
          headers: { 'Accept': 'application/geo+json' }
        })
        const json = await res.json()
        if(mounted && json.features && json.features.length > 0){
          const headline = json.features[0].properties?.headline || json.features[0].properties?.event
          setInternetAlert(headline)
        }
      } catch {
        // fail silently, keep showing "No emergencies"
      }
    }

    run()
    fetchLive()
    const id = setInterval(()=>{ run(); fetchLive() }, 15*60*1000) // auto-refresh every 15 min

    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold flex items-center gap-2">📌 PINNED ALERT</p>
      {alert? (
        <>
          <p className="text-sm mt-2 text-white/90 line-clamp-3">{alert.body}</p>
          <p className="text-xs mt-2 text-white/50">{new Date(alert.created_at).toLocaleString()} • {zip}</p>
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
