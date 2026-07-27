'use client'
import { useState, useEffect } from 'react'

export default function WeatherBar({ zip }: { zip: string }) {
  const [temp, setTemp] = useState<number | null>(null)
  const [desc, setDesc] = useState('loading...')
  const [city, setCity] = useState(zip)

  useEffect(() => {
    try {
      const safeZip = String(zip||'').trim()
      if (!safeZip || safeZip.toUpperCase() === 'YOUR BLOCK') return
      let cancelled = false
      async function load() {
        try {
          if (cancelled) return
          try { setCity(safeZip) } catch {}
          try { setDesc('loading...') } catch {}
          const res = await fetch(`/api/weather?zip=${encodeURIComponent(safeZip)}`, { cache: 'no-store' })
          if (!res.ok) return
          const data = await res.json()
          if (cancelled) return
          let t = (data as any)?.temp ?? (data as any)?.main?.temp ?? null
          if (t!== null && typeof t === 'number' && t > 150) t = Math.round((t - 273.15) * 9/5 + 32)
          if (t!== null) try { setTemp(Math.round(t)) } catch {}
          try {
            if ((data as any)?.description) setDesc((data as any).description)
            else if ((data as any)?.weather?.[0]?.description) setDesc((data as any).weather[0].description)
            else if ((data as any)?.weather?.[0]?.main) setDesc((data as any).weather[0].main)
            else setDesc('')
          } catch { try { setDesc('') } catch {} }
          try {
            if ((data as any)?.city) setCity((data as any).city)
            else if ((data as any)?.name) setCity((data as any).name)
            else setCity(safeZip)
          } catch {}
        } catch { try { setDesc('') } catch {} }
      }
      load()
      const interval = setInterval(load, 300000)
      return () => { cancelled = true; try { clearInterval(interval) } catch {} }
    } catch {}
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="text-white/60 text-xs font-black">🌤 WEATHER • {zip} • Live</div>
      <div className="flex items-center gap-3 mt-1">
        <div className="text-white text-3xl font-black">{temp!== null? `${temp}°F` : '--°F'}</div>
        <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full truncate">{city}</span>
      </div>
      <div className="text-white/60 text-xs mt-1 capitalize">{desc? `${desc} • ${city}` : city}</div>
      <div className="text-white/40 text-xs mt-2">Live from OpenWeather, NOAA, USGS • auto-refresh 5m</div>
    </div>
  )
}
