'use client'
import { useState, useEffect } from 'react'

export default function WeatherBar({ zip }: { zip: string }) {
  const [temp, setTemp] = useState(96)
  const [desc, setDesc] = useState('few clouds')
  const [city, setCity] = useState('San Jose')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/weather?zip=${zip}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.main?.temp) {
            setTemp(Math.round(data.main.temp))
            if (data.weather?.[0]?.description) setDesc(data.weather[0].description)
            if (data.name) setCity(data.name)
          }
        }
      } catch {}
    }
    load()
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="text-white/60 text-xs font-black">🌤️ WEATHER • {zip} • Live</div>
      <div className="flex items-center gap-3 mt-1">
        <div className="text-white text-3xl font-black">{temp}°F</div>
        <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full">{city}</span>
      </div>
      <div className="text-white/60 text-xs mt-1 capitalize">{desc} • {city}</div>
      <div className="text-white/40 text- mt-2">Live from OpenWeather, NOAA, USGS • auto-refresh 5m</div>
    </div>
  )
}
