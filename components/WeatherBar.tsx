'use client'
import { useState, useEffect } from 'react'

export default function WeatherBar({ zip }: { zip: string }) {
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Try your own api route first
        const res = await fetch(`/api/weather?zip=${zip}`)
        if (res.ok) {
          const data = await res.json()
          setWeather(data)
          if (data?.main?.temp) {
            localStorage.setItem('sss_live_temp_95122', String(Math.round(data.main.temp)))
          }
          return
        }
      } catch {}

      // Fallback - direct OpenWeather if you have key
      try {
        const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_KEY
        if (key) {
          const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${key}`)
          const d = await r.json()
          if (d?.main?.temp) {
            setWeather(d)
            localStorage.setItem('sss_live_temp_95122', String(Math.round(d.main.temp)))
          }
        }
      } catch {}
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [zip])

  if (!weather) {
    return (
      <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
        <div className="text-white/60 text-xs font-black">🌤️ WEATHER • {zip} • Live</div>
        <div className="text-white/40 text-sm mt-2">Loading live weather...</div>
      </div>
    )
  }

  const temp = Math.round(weather.main.temp)
  const desc = weather.weather?.[0]?.description || 'few clouds'

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="text-white/60 text-xs font-black">🌤️ WEATHER • {zip} • Live</div>
      <div className="flex items-center gap-3 mt-1">
        <div className="text-white text-3xl font-black">{temp}°F</div>
        <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full">{weather.name || 'San Jose'}</span>
      </div>
      <div className="text-white/60 text-xs mt-1 capitalize">{desc} • {weather.name || 'San Jose'}</div>
      <div className="text-white/40 text- mt-2">Live from OpenWeather, NOAA, USGS • auto-refresh 5m</div>
    </div>
  )
}
