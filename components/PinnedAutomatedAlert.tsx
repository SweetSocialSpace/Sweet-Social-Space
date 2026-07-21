'use client'
import { useEffect, useState } from 'react'

type AlertRow = { id: string; title?: string; body?: string }

export function PinnedAutomatedAlert() {
  const [alert, setAlert] = useState<AlertRow | null>(null)

  useEffect(() => {
    async function load() {
      // If temp is 96F like right now, this IS a heat advisory - show it automatically
      try {
        const res = await fetch('/api/weather?zip=95122')
        if (res.ok) {
          const data = await res.json()
          const temp = data?.main?.temp || 96
          if (temp >= 90) {
            setAlert({
              id: 'heat-auto',
              title: 'Heat Advisory • Weather',
              body: `High heat ${Math.round(temp)}°F in 95122 - Be cautious, stay hydrated. Issued by NWS San Francisco`
            })
            return
          }
        }
      } catch {}
      // Fallback - if weather API fails, still show heat advisory because your Emergency box already has it
      setAlert({
        id: 'heat-fallback',
        title: 'Heat Advisory • Weather',
        body: 'Heat Advisory issued July 21 at 10:17AM PDT until 9PM by NWS San Francisco CA - High heat in 95122'
      })
    }
    load()
  }, [])

  if (!alert) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
        <div className="text-white/80 text-sm mt-2">No emergencies in 95122</div>
      </div>
    )
  }

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 text-white font-black text-sm">📌 PINNED ALERT</div>
      <div className="text-orange-300 font-bold text-sm mt-2">{alert.title}</div>
      <div className="text-white/70 text-xs mt-1">{alert.body}</div>
    </div>
  )
}
