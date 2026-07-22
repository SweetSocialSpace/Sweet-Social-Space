'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import 'leaflet/dist/leaflet.css'

export default function BlockMapPage(){
  const [L, setL] = useState<any>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(()=>{
    import('leaflet').then((leaflet)=>{
      // Fix icon issue
      // @ts-ignore
      delete leaflet.Icon.Default.prototype._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      setL(leaflet)
    })
  },[])

  useEffect(()=>{
    if(!L || mapReady) return
    const map = L.map('block-map', {
      center: [37.3396, -121.8611], // REAL Story & King - 95122
      zoom: 15,
      scrollWheelZoom: true,
      wheelDebounceTime: 40,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    // REAL 95122 coordinates - fixed
    const pins = [
      { lat: 37.3396, lng: -121.8611, label: '📍 Story & King', color: '#dc2626', addr: 'Story Rd & King Rd, 95122' },
      { lat: 37.3415, lng: -121.8552, label: '🌮 Tacos El Jefe', color: '#2563eb', addr: 'Little Portugal' },
      { lat: 37.3389, lng: -121.8589, label: '🏷 Sale - King Rd', color: '#16a34a', addr: '1845 King Rd' },
    ]

    pins.forEach(p=>{
      const icon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background:${p.color}; color:white; padding:6px 12px; border-radius:999px; font-weight:900; font-size:12px; box-shadow:0 4px 10px rgba(0,0,0,.5); white-space:nowrap; transform:translate(-50%,-100%)">${p.label}</div>`,
      })
      L.marker([p.lat, p.lng], {icon}).addTo(map).bindPopup(`<b>${p.label}</b><br/>${p.addr}<br/><a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}" target="_blank">Open in Maps</a>`)
    })

    setMapReady(true)
    return ()=> { map.remove() }
  },[L, mapReady])

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', background:'#3d2800'}}>
      <Header />
      <div style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', background:'#a67c00', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900, margin:0, fontSize:16}}>BLOCK MAP • 95122 • 3 PINS • LIVE</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <Link href="/feed" style={{background:'white', color:'black', padding:'6px 16px', borderRadius:999, textDecoration:'none', fontWeight:900}}>← Back</Link>
        </div>
      </div>
      <div id="block-map" style={{flex:1, margin:12, borderRadius:16, overflow:'hidden', background:'#ddd'}} />
    </div>
  )
}
