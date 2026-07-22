'use client'
import { useEffect, useRef } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'

export default function BlockMapPage(){
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)

  useEffect(()=>{
    if(!mapRef.current || leafletRef.current) return
    
    // dynamic import so Vercel doesn't SSR it
    import('leaflet').then(L=>{
      if(!mapRef.current) return
      
      const map = L.map(mapRef.current, {
        center: [37.3397, -121.8545], // REAL Story & King
        zoom: 16,
        zoomControl: true,
      })
      leafletRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // REAL 95122 pins - these are locked by Leaflet, not by me
      const pins = [
        {lat:37.3397, lng:-121.8545, label:'📍 Story & King'},
        {lat:37.3385, lng:-121.8535, label:'🌮 Tacos'},
        {lat:37.3410, lng:-121.8555, label:'🏷️ Sale'},
      ]

      pins.forEach(p=>{
        L.marker([p.lat, p.lng])
          .addTo(map)
          .bindPopup(`<a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}" target="_blank">${p.label} - Get Directions</a>`)
      })
    })

    return ()=> {
      if(leafletRef.current){
        leafletRef.current.remove()
        leafletRef.current = null
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
      <div ref={mapRef} style={{flex:1, width:'100%'}} />
    </div>
  )
}
