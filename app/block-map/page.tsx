'use client'
import { useEffect, useRef } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMapPage(){
  const { zip } = useLocation()
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if(typeof window === 'undefined' || !containerRef.current) return

    // Load Leaflet CSS + JS from CDN
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = (window as any).L
      if(!L || mapRef.current) return

      const map = L.map(containerRef.current!, {
        center: [37.335, -121.855],
        zoom: 13
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM'
      }).addTo(map)

      L.marker([37.336, -121.881]).addTo(map).bindPopup('📍 Story & King • 95122')
      L.marker([37.332, -121.875]).addTo(map).bindPopup('🌮 Tacos El Jefe')
      L.marker([37.339, -121.863]).addTo(map).bindPopup('🏷️ King Rd Sale')

      const group = L.featureGroup([
        L.marker([37.336, -121.881]),
        L.marker([37.332, -121.875]),
        L.marker([37.339, -121.863])
      ])
      map.fitBounds(group.getBounds().pad(0.3))

      mapRef.current = map
    }
    document.body.appendChild(script)
  }, [])

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'radial-gradient(circle at top, #a67c00, #3d2800)'}}>
      <Header />
      <div style={{flex:'0 0 auto', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900, fontSize:'clamp(16px, 2vw, 24px)'}}>BLOCK MAP • {zip || '95122'} • 3 PINS • LIVE</h1>
        <Link href="/feed" style={{background:'white', color:'black', fontWeight:900, padding:'8px 20px', borderRadius:'999px', textDecoration:'none'}}>← Back to Feed</Link>
      </div>
      <div ref={containerRef} style={{flex:'1 1 auto', margin:'0 16px 16px 16px', borderRadius:'16px', overflow:'hidden', minHeight:0, background:'white'}} />
    </div>
  )
}
