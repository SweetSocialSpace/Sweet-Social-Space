'use client'
import { useState, useEffect } from 'react'

export default function WeatherBar({ zip }: { zip: string }) {
  const [temp, setTemp] = useState<number | null>(null)
  const [desc, setDesc] = useState('few clouds')
  const [city, setCity] = useState('San Jose')

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('sss_live_temp_95122')
      if (saved) setTemp(parseInt(saved))
    }
    load()
    const i = setInterval(load, 10000) // sync with LivePulse every 10s
    return () => clearInterval(i)
  }, [])

  if (!temp) return null

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
      <div className="text-white/60 text-xs font-black">🌤️ WEATHER • {zip} • Live</div>
      <div className="flex items-center gap-3 mt-1">
        <div className="text-white text-3xl font-black">{temp}°F</div>
        <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full">{city}</span>
      </div>
      <div className="text-white/60 text-xs mt-1">{desc} • {city}</div>
    </div>
  )
}
