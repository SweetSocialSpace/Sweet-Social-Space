'use client'
import { useEffect, useState } from 'react'

export default function WeatherBar({ zip = '95122' }: { zip?: string }) {
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    // 95122 = San Jose lat/lon
    const lat = 37.311
    const lon = -121.817
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Los_Angeles`)
     .then(r => r.json())
     .then(setWeather)
  }, [zip])

  if (!weather) return <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 text-white">Loading weather for {zip}...</div>

  const code = weather.current.weather_code
  const temp = Math.round(weather.current.temperature_2m)
  const high = Math.round(weather.daily.temperature_2m_max[0])
  const low = Math.round(weather.daily.temperature_2m_min[0])
  const wind = Math.round(weather.current.wind_speed_10m)

  const condition = code <= 3? 'Clear / Partly Cloudy' : code <= 51? 'Cloudy / Drizzle' : code <= 67? 'Rain' : 'Clear'

  return (
    <div className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 backdrop-blur-xl rounded-2xl p-4 text-white border border-white/10">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-black text-sm">🌤️ WEATHER • {zip} • NWS Live</div>
          <div className="text-3xl font-black mt-1">{temp}°F</div>
          <div className="text-xs opacity-90">{condition} • H:{high}° L:{low}° • Wind {wind} mph</div>
        </div>
        <div className="text-right">
          <div className="text-xs bg-white text-black font-black px-2 py-1 rounded-full">San Jose, CA</div>
          <div className="text- mt-2 opacity-70">via Open-Meteo / NWS</div>
        </div>
      </div>
    </div>
  )
}
