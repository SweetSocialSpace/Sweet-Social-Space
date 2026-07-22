'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'

export default function BlockMapPage(){
  const mapDivRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(()=>{
    // 1. Load CSS once
    if(!document.getElementById('leaflet-css')){
      const link=document.createElement('link')
      link.id='leaflet-css'
      link.rel='stylesheet'
      link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    let map:any = null
    let ro:any = null

    const start = async()=>{
      if(!mapDivRef.current) return
      const L = await import('leaflet')

      // Clear old map if hot reload
      if((mapDivRef.current as any)._leaflet_id){
        (mapDivRef.current as any)._leaflet_id = null
        mapDivRef.current.innerHTML=''
      }

      map = L.map(mapDivRef.current, {
        center:[37.3396,-121.8611],
        zoom:15,
        scrollWheelZoom:true,
        dragging:true,
        zoomControl:true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'&copy; OpenStreetMap'
      }).addTo(map)

      // REAL marker layer - pins locked to streets
      const pins=[
        {lat:37.3396,lng:-121.8611,label:'📍 Story & King',color:'#dc2626'},
        {lat:37.3415,lng:-121.8552,label:'🌮 Tacos',color:'#2563eb'},
        {lat:37.3389,lng:-121.8589,label:'🏷 Sale',color:'#16a34a'},
      ]
      pins.forEach(p=>{
        L.marker([p.lat,p.lng],{
          icon:L.divIcon({
            className:'',
            html:`<div style="background:${p.color};color:white;padding:6px 12px;border-radius:999px;font-weight:900;font-size:12px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.6)">${p.label}</div>`,
            iconSize:[120,30],
            iconAnchor:[60,15]
          })
        }).addTo(map)
      })

      // Auto-fix for your split tiles
      const fix=()=>{ if(map) map.invalidateSize(true) }
      fix()
      setTimeout(fix,200)
      setTimeout(fix,800)

      // Watch container - if it resizes, refill map
      ro = new ResizeObserver(fix)
      ro.observe(mapDivRef.current)
      
      setReady(true)
    }

    start()
    return()=>{
      if(ro) ro.disconnect()
      if(map) try{ map.remove() }catch{}
    }
  },[])

  return(
    <div style={{width:'100vw', height:'100dvh', display:'flex', flexDirection:'column', overflow:'hidden', background:'#f5f5f5'}}>
      <Header/>
      <div style={{height:56, flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center', background:'#a67c00', padding:'0 16px'}}>
        <h1 style={{color:'white',fontWeight:900,margin:0,fontSize:16}}>BLOCK MAP • 95122 • 3 PINS • {ready?'LIVE':'LOADING...'}</h1>
        <Link href="/feed" style={{background:'white',color:'black',padding:'6px 16px',borderRadius:999,textDecoration:'none',fontWeight:900}}>← Back</Link>
      </div>
      {/* THIS IS 100% - WILL FILL YOUR 15" LAPTOP BRACKET */}
      <div style={{width:'100%', height:'calc(100dvh - 56px)', position:'relative'}}>
        <div ref={mapDivRef} style={{width:'100%', height:'100%', display:'block'}} />
      </div>
    </div>
  )
}
