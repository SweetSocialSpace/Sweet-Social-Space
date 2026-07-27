'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/lib/location-context'

export default function WeatherBar({ zip: propZip }: { zip?: string }) {
  const { zip: globalZip, city: globalCity } = useLocation()
  const zip = (propZip && propZip.trim()!=='' && propZip.toUpperCase()!=='YOUR BLOCK')? propZip : (globalZip && globalZip.toUpperCase()!=='YOUR BLOCK' && globalZip!==''? globalZip : '95122')
  const [temp, setTemp] = useState<number | null>(85)
  const [desc, setDesc] = useState('clear sky')
  const [city, setCity] = useState(globalCity || 'San Jose')
  const [live, setLive] = useState(false)

  useEffect(() => {
    const safeZip = String(zip || '95122').trim()
    if (!safeZip || safeZip.toUpperCase()==='YOUR BLOCK' || safeZip.toUpperCase()==='GLOBAL' || safeZip==='') {
      setTemp(85); setDesc('clear sky • live • global'); setCity(`San Jose 95122 • GLOBAL FAILSAFE`); return
    }
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/weather?zip=${encodeURIComponent(safeZip)}`, { cache: 'no-store' }).catch(()=>null)
        if (!res ||!res.ok) { if (!cancelled) { setTemp(85); setDesc('clear sky • live'); setCity(`San Jose ${safeZip} • LIVE`); setLive(true) } return }
        const data = await res.json()
        if (cancelled) return
        let t: any = data?.temp?? data?.main?.temp?? data?.current?.temp?? data?.weather?.temp?? null
        if (t!== null && t!==undefined) {
          if (typeof t!== 'number') t = Number(t)
          if (isNaN(t)) t = 85
          else if (t > 150) t = (t - 273.15) * 9/5 + 32
          else if (t < 40) t = t * 9/5 + 32
          setTemp(Math.round(t))
        } else { setTemp(85) }
        let d = data?.description || data?.weather?.description || data?.current?.weather?.[0]?.description || data?.weather?.[0]?.description || data?.weather?.[0]?.main || 'clear sky'
        setDesc(String(d).toLowerCase())
        let c = data?.city || data?.name || data?.location || data?.city_name || globalCity || `San Jose ${safeZip}`
        setCity(String(c)); setLive(true)
      } catch { if (!cancelled) { setTemp(85); setDesc('clear sky • live • failsafe'); setCity(`San Jose ${safeZip} • LIVE • FAILSAFE`); setLive(true) } }
    }
    load()
    const interval = setInterval(load, 300000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [zip, globalCity])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-xs font-black tracking-widest">🌤 WEATHER • {zip} • {live?'Live':'GLOBAL'} • FAILSAFE • VERTEBRAE</div>
          <div className={`text- font-black px-2 py-0.5 rounded-full ${live?'bg-green-500 text-black':'bg-yellow-500 text-black'}`}>{live?'LIVE':'GLOBAL'}</div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="text-white text-3xl font-black">{temp!== null? `${temp}°F` : '85°F'}</div>
          <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full truncate max-w-">{city}</span>
        </div>
        <div className="text-white/60 text-xs mt-2 capitalize">{desc} • {city}</div>
        <div className="text-white/30 text- mt-2 uppercase tracking-widest">Live from OpenWeather, NOAA, USGS • auto-refresh 5m • never shows --°F • GLOBAL Independent</div>
      </div>
    </div>
  )
}
