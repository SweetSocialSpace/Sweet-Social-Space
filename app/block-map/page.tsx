'use client'
import { useEffect, useRef } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMapPage(){
  const { zip } = useLocation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(()=>{
    if(typeof window === 'undefined' ||!mapRef.current || mapInstance.current) return
    // Load Leaflet dynamically
    const load = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css' as any)

      if(mapInstance.current) return
      const map = L.map(mapRef.current!).setView([37.3352, -121.8811], 13) // 95122 center
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // 3 live pins for 95122
      L.marker([37.3352, -121.8811]).addTo(map).bindPopup("Story & King - LIVE")
      L.marker([37.325, -121.89]).addTo(map).bindPopup("Tacos El Jefe - OPEN")
      L.marker([37.34, -121.87]).addTo(map).bindPopup("Yard Sale - King Rd")

      mapInstance.current = map
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-white font-black text-2xl">BLOCK MAP • {zip || '95122'} • LIVE • 3 PINS</h1>
            <Link href="/feed" className="bg-white text-black font-black px-6 py-2 rounded-full hover:bg-yellow-400 transition">← Back to Feed</Link>
          </div>
          <div ref={mapRef} className="w-full h- rounded-2xl border-4 border-white/20 overflow-hidden bg-white" />
          <div className="text-center text-white/50 text-xs mt-3">Full Bloom Map • Golden backdrop stays on /feed • 95122 live</div>
        </div>
      </div>
    </>
  )
}
