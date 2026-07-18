'use client'
import { useEffect, useState } from 'react'

export default function WeatherBar({ zip = '95122' }: { zip?: string }) {
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/weather?zip=${zip}`)
    .then(r => r.json())
    .then(setWeather)
  }, [zip])

  if (!weather || weather.error) return <div className="bg-black/60 rounded-2xl p-4 text-white text-sm">Loading weather for {zip}...</div>

  return (
    <div className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 rounded-2xl p-4 text-white border border-white/10">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-black text-xs">🌤️ WEATHER • {zip} • Live</div>
          <div className="text-3xl font-black mt-1">{weather.temp}°F</div>
          <div className="text-xs opacity-90 capitalize">{weather.description} • {weather.city}</div>
        </div>
        <div className="text-xs bg-white text-black font-black px-2 py-1 rounded-full h-fit">{weather.city}</div>
      </div>
    </div>
  )
}
