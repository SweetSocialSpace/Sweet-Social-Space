'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { createClient } from '@/lib/supabase/client'

export default function BlockMap() {
  const { zip, lat, lng, city } = useLocation()
  const [posts, setPosts] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('posts').select('*').limit(20).order('created_at',{ascending:false})
      if (data) setPosts(data)
    })()
  }, [zip])

  const mapLat = lat || 37.3382
  const mapLng = lng || -121.8863

  useEffect(() => {
    // Load Leaflet only once
    if (typeof window === 'undefined') return
    const existing = document.getElementById('leaflet-css')
    if (!existing) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const scriptId = 'leaflet-js'
    if (document.getElementById(scriptId)) {
      // @ts-ignore
      if (window.L) initMap()
      return
    }
    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.body.appendChild(script)

    function initMap() {
      // @ts-ignore
      const L = window.L
      if (!L) return
      const container = document.getElementById('block-map-div')
      if (!container || (container as any)._leaflet_id) return
      const map = L.map('block-map-div', { zoomControl: false, attributionControl: false }).setView([mapLat, mapLng], 14)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)
      L.marker([mapLat, mapLng]).addTo(map).bindPopup(`${zip}`)
    }
  }, [mapLat, mapLng, zip])

  useEffect(() => {
    // @ts-ignore
    const L = window.L
    const container = document.getElementById('block-map-div')
    if (!L ||!container ||!(container as any)._leaflet_id) return
    // @ts-ignore
    const map = L.map('block-map-div')
    // recenter when zip changes
    try {
      // @ts-ignore
      const existingMap = (container as any)._leaflet_map || Object.values((L as any).DomUtil? [] : [])
      // simple: just set view if map exists
      // @ts-ignore
      const m = L.DomUtil.get('block-map-div')?._leaflet_map
    } catch {}
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs mb-2">🗺️ BLOCK MAP • {zip} • {posts.length} LIVE PINS</div>

      <div id="block-map-div" className="w-full h- rounded-xl overflow-hidden border border-white/10 bg-zinc-900 z-0" />

      <div className="mt-2 flex gap-2">
        <div className="bg-black text-white text- px-3 py-1.5 rounded-full border border-white/20 font-black">
          📍 San Jose 95122 • {posts.length} pins
        </div>
        <a href={`https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`} target="_blank" className="bg-white text-black text- px-3 py-1.5 rounded-full font-black">
          Open Map
        </a>
      </div>

      <div className="mt-3 space-y-1">
        <div className="text- font-black text-white/90">📍 {city || 'San Jose'} {zip}</div>
        {posts.slice(0,4).map((p:any)=>(
          <div key={p.id} className="text- text-white/60 truncate flex gap-1.5">
            <span>📍</span><span className="font-bold">{p.category?.toUpperCase()}</span><span className="truncate">• {p.body?.slice(0,45)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
