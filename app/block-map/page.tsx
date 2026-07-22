'use client'
import { useEffect, useRef } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'

export default function BlockMapPage(){
  const mapDiv = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(()=>{
    if(!mapDiv.current || mapInstance.current) return

    // Load Leaflet CSS
    if(!document.querySelector('link[href*="leaflet.css"]')){
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = (window as any).L
      if(!L || !mapDiv.current) return

      const map = L.map(mapDiv.current).setView([37.3397, -121.8545], 16)
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // Real pins - locked to ground, no lag
      L.marker([37.3397, -121.8545]).addTo(map).bindPopup('📍 Story & King')
      L.marker([37.3385, -121.8535]).addTo(map).bindPopup('🌮 Tacos')
      L.marker([37.3410, -121.8555]).addTo(map).bindPopup('🏷️ Sale')
    }
    document.body.appendChild(script)

    return ()=>{
      if(mapInstance.current){
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  },[])

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'#3d2800'}}>
      <Header />
      <div style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', background:'#a67c00'}}>
        <h1 style={{color:'white', fontWeight:900, margin:0}}>BLOCK MAP • 95122 • 3 PINS • LIVE</h1>
        <Link href="/feed" style={{background:'white', color:'black', fontWeight:900, padding:'8px 20px', borderRadius:'999px', textDecoration:'none'}}>← Back to Feed</Link>
      </div>
      <div ref={mapDiv} style={{flex:1, width:'100%', minHeight:'400px', background:'white'}} />
    </div>
  )
}
