'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LivePulse() {
  const supabase = createClient()
  const [temp, setTemp] = useState<number | null>(null)
  const [online, setOnline] = useState(0)
  const [verified, setVerified] = useState({ percent: 100, count: '3/3' })

  useEffect(() => {
    // ONE weather source for whole platform
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather?zip=95122')
        const data = await res.json()
        if (data?.main?.temp) setTemp(Math.round(data.main.temp))
      } catch {
        // fallback to OpenWeather direct if your api route not ready
        try {
          const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=95122,us&units=imperial&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}`)
          const d = await r.json()
          if (d?.main?.temp) setTemp(Math.round(d.main.temp))
        } catch {}
      }
    }
    
    // Real online count from profiles active in last 5 min
    const fetchOnline = async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen', new Date(Date.now() - 5*60*1000).toISOString())
      setOnline(count || 0)
    }

    fetchWeather()
    fetchOnline()
    
    // Store temp globally so WeatherBar can use SAME temp
    const interval = setInterval(() => {
      fetchWeather()
      fetchOnline()
    }, 5*60*1000) // refresh every 5 min like you have in UI
    
    return () => clearInterval(interval)
  }, [])

  // Save temp for WeatherBar to read - single source of truth
  useEffect(() => {
    if (temp) localStorage.setItem('sss_live_temp_95122', String(temp))
  }, [temp])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-white text-black font-black px-3 py-1 rounded-full text-xs">LIVE 95122</span>
        {temp && <span className="bg-white/20 text-white font-black px-3 py-1 rounded-full text-xs">{temp}° 95122 Live</span>}
        <span className="bg-white/10 text-white font-bold px-3 py-1 rounded-full text-xs">{online} online</span>
      </div>
      <div className="flex items-center gap-2 text-white/80 text-xs">
        <span className="w-3 h-3 rounded-full bg-blue-400"></span>
        <span className="font-black">{verified.percent}% Verified • 95122</span>
        <span className="ml-auto font-bold">{verified.count}</span>
      </div>
    </div>
  )
}
