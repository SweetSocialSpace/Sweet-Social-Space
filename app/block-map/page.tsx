'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'

export default function BlockMapPage(){
  const [ready, setReady] = useState(false)

  useEffect(()=>{
    // Inject leaflet CSS via CDN - avoids Vercel Module not found error
    if(!document.querySelector('#leaflet-css')){
      const link = document.createElement('link')
      link.id='leaflet-css'
      link.rel='stylesheet'
      link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const load = async () => {
      // @ts-ignore
      const L = await import('leaflet')
      
      // Fix icons
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map('block-map', {
        center: [37.3396, -121.8611], // REAL Story & King
        zoom: 15,
        scrollWheelZoom: true, // WHEEL WORKS NOW
        dragging: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)

      const pins = [
        { lat: 37.3396, lng: -121.8611, label: '📍 Story & King', color: '#dc2626' },
        { lat: 37.3415, lng: -121.8552, label: '🌮 Tacos', color: '#2563eb' },
        { lat: 37.3389, lng: -121.8589, label: '🏷 Sale', color: '#16a34a' },
      ]

      pins.forEach(p=>{
        const icon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background:${p.color}; color:white; padding:6px 12px; border-radius:999px; font-weight:900; font-size:12px; box-shadow:0 4px 10px rgba(0,0,0,.5); white-space:nowrap; cursor:pointer;">${p.label}</div>`,
          iconSize: [100, 30],
        })
        L.marker([p.lat, p.lng], {icon}).addTo(map).bindPopup(`<a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}" target="_blank">${p.label}</a>`)
      })

      setReady(true)
    }

    load()
  },[])

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', background:'#3d2800'}}>
      <Header />
      <div style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', background:'#a67c00', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900, margin:0, fontSize:16}}>BLOCK MAP • 95122 • 3 PINS • LIVE {ready ? '' : '• Loading...'}</h1>
        <Link href="/feed" style={{background:'white', color:'black', padding:'6px 16px', borderRadius:999, textDecoration:'none', fontWeight:900}}>← Back</Link>
      </div>
      <div id="block-map" style={{flex:1, margin:12, borderRadius:16, overflow:'hidden', background:'#ddd', zIndex:0}} />
    </div>
  )
}
