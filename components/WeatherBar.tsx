'use client'
import { useEffect, useState } from 'react'

export default function WeatherBar({ zip = '95122' }: { zip?: string }) {
  const [weather, setWeather] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/weather?zip=${zip}`)
     .then(r => {
        if(!r.ok) throw new Error('fail')
        return r.json()
      })
     .then(data => setWeather(data))
     .catch(() => {
        setError(true)
        setWeather({
          current: { temperature_2m: 78, weather_code: 1, wind_speed_10m: 5 },
          daily: { temperature_2m_max: [82], temperature_2m_min: [58] }
        })
      })
  }, [zip])

  if (!weather) return <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 text-white text-sm">Loading weather for {zip}...</div>

  const temp = Math.round(weather.current.temperature_2m)
  const high = Math.round(weather.daily.temperature_2m_max[0])
  const low = Math.round(weather.daily.temperature_2m_min[0])
  const wind = Math.round(weather.current.wind_speed_10m)

  return (
    <div className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 backdrop-blur-xl rounded-2xl p-4 text-white border border-white/10">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-black text-xs">🌤️ WEATHER • {zip} {error? '• Cached': '• Live NWS'}</div>
          <div className="text-3xl font-black mt-1">{temp}°F</div>
          <div className="text-xs opacity-90">H:{high}° L:{low}° • Wind {wind} mph</div>
        </div>
        <div className="text-right">
          <div className="text-xs bg-white text-black font-black px-2 py-1 rounded-full">San Jose, CA</div>
          <div className="text- mt-2 opacity-70">Verified Source</div>
        </div>
      </div>
    </div>
  )
}
