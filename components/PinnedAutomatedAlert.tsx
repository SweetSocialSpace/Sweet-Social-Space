'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AlertRow = { id: string; message?: string; title?: string; body?: string; created_at?: string }

export function PinnedAutomatedAlert() {
  const [alert, setAlert] = useState<AlertRow | null>(null)
  const [zip] = useState('95122')

  useEffect(() => {
    let mounted = true

    const run = async () => {
      const supabase = createClient()
      // 1. Check manual alerts table first (your existing logic)
      try {
        const { data } = await supabase.from('alerts').select('id,message,title,body,created_at').eq('is_active', true).limit(1)
        if (mounted && data && data.length > 0) {
          setAlert(data[0] as any)
          return
        }
      } catch {}

      // 2. If no manual alert, AUTOMATED fallback to live NWS Heat Advisory
      try {
        const res = await fetch(`/api/weather?zip=${zip}`)
        if (res.ok) {
          const w = await res.json()
          // OpenWeather alerts or your emergency API
          if (w.alerts && w.alerts[0]) {
            if (mounted) setAlert({ id: 'nws', title: w.alerts[0].event, body: w.alerts[0].description, message: w.alerts[0].event })
            return
          }
        }
        // Also check emergency endpoint
        const res2 = await fetch(`/api/emergency?zip=${zip}`).catch(()=>null)
        if (res2 && res2.ok) {
          const e = await res2.json()
          if (e && e[0]) {
            if (mounted) setAlert({ id: e[0].id || 'nws', title: e[0].title, body: e[0].body || e[0].message, message: e[0].title })
          }
        }
      } catch {}
    }

    run()
    const id = setInterval(run, 5 * 60 * 1000)
    return () => { mounted = false; clearInterval(id) }
  }, [zip])

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
        <div className="text-white/80 text-sm mt-2">No emergencies in {zip}</div>
      </div>
    )
  }

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
      <div className="text-orange-300 font-bold text-sm mt-2">{alert.title || alert.message || 'Weather Alert'}</div>
      <div className="text-white/70 text-xs mt-1 line-clamp-3">{alert.body || alert.message}</div>
    </div>
  )
}
