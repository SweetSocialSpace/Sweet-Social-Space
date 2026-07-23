'use client'
import { useState, useEffect } from 'react'

export default function WeatherBar({ zip }: { zip: string }) {
  const [temp, setTemp] = useState<number | null>(null)
  const [desc, setDesc] = useState('loading...')
  const [city, setCity] = useState(zip)

  useEffect(() => {
    async function load() {
      setCity(zip)
      setDesc('loading...')
      try {
        const res = await fetch(`/api/weather?zip=${zip}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          let t = data?.main?.temp?? data?.temp?? null
          if (t!== null && t > 150) t = Math.round((t - 273.15) * 9/5 + 32) // Kelvin to F
          if (t!== null) setTemp(Math.round(t))
          if (data?.weather?.[0]?.description) setDesc(data.weather[0].description)
          else if (data?.weather?.[0]?.main) setDesc(data.weather[0].main)
          if (data?.name) setCity(data.name)
          else if (data?.city) setCity(data.city)
        }
      } catch {
        setDesc('')
      }
    }
    if (zip) load()
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="text-white/60 text-xs font-black">🌤 WEATHER • {zip} • Live</div>
      <div className="flex items-center gap-3 mt-1">
        <div className="text-white text-3xl font-black">{temp!== null? `${temp}°F` : '--°F'}</div>
        <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full truncate">{city}</span>
      </div>
      <div className="text-white/60 text-xs mt-1 capitalize">{desc? `${desc} • ${city}` : city}</div>
      <div className="text-white/40 text- mt-2">Live from OpenWeather, NOAA, USGS • auto-refresh 5m</div>
    </div>
  )
}
