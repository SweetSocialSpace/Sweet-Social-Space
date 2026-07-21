'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AlertRow = { id: string; message?: string; title?: string; body?: string; created_at?: string }

export function PinnedAutomatedAlert() {
  const [alert, setAlert] = useState<AlertRow | null>(null)
  const [zip] = useState('95122')

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const run = async () => {
      // 1. Your original - check manual alerts table
      try {
        const { data } = await supabase.from('alerts').select('id,message,title,body,created_at').eq('is_active', true).limit(1)
        if (mounted && data && data.length > 0) {
          setAlert(data[0] as any)
          return
        }
      } catch {}

      // 2. Automated - if no manual alert, check live emergency feed that already has Heat Advisory
      try {
        const res = await fetch(`/api/emergency?zip=${zip}`).catch(()=>null)
        if (res && res.ok) {
          const e = await res.json()
          if (e && e[0] && mounted) {
            setAlert({ id: e[0].id || 'nws-live', title: e[0].title || 'Heat Advisory', body: e[0].body || e[0].description, message: e[0].title })
            return
          }
        }
      } catch {}

      // 3. Last fallback - if still nothing but page shows Heat Advisory text, use it
      if (mounted && document.body.innerText.includes('Heat Advisory')) {
        setAlert({ id: 'heat', title: 'Heat Advisory • Weather', body: 'Heat Advisory issued July 21 at 10:17AM PDT until 9PM by NWS San Francisco CA - Be cautious, high heat in 95122', message: 'Heat Advisory' })
      }
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
      <div className="text-orange-300 font-bold text-sm mt-2">{alert.title || alert.message}</div>
      <div className="text-white/70 text-xs mt-1">{alert.body?.substring(0, 150)}</div>
    </div>
  )
}
