'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'

export default function BlockMapPage(){
  const [ready, setReady] = useState(false)

  useEffect(()=>{
    if(!document.querySelector('#leaflet-css')){
      const l=document.createElement('link')
      l.id='leaflet-css'; l.rel='stylesheet'
      l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(l)
    }
    let map:any=null
    const init=async()=>{
      const L=await import('leaflet')
      const el=document.getElementById('block-map') as any
      if(!el || el._leaflet_id) return
      
      // 100% container
      map=L.map(el,{
        center:[37.3396,-121.8611],
        zoom:15,
        scrollWheelZoom:true,
        dragging:true,
        zoomControl:true
      })
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'&copy; OpenStreetMap'
      }).addTo(map)

      // REAL MARKER LAYER - not overlay divs
      const pins=[
        {lat:37.3396,lng:-121.8611,label:'📍 Story & King',color:'#dc2626'},
        {lat:37.3415,lng:-121.8552,label:'🌮 Tacos',color:'#2563eb'},
        {lat:37.3389,lng:-121.8589,label:'🏷 Sale',color:'#16a34a'},
      ]
      
      pins.forEach(p=>{
        const icon=L.divIcon({
          className:'real-pin',
          html:`<div style="background:${p.color};color:white;padding:6px 12px;border-radius:999px;font-weight:900;font-size:12px;white-space:nowrap;box-shadow:0 4px 10px rgba(0,0,0,.5)">${p.label}</div>`,
          iconSize:[100,30],
          iconAnchor:[50,15]
        })
        L.marker([p.lat,p.lng],{icon}).addTo(map)
      })

      // Force full size
      const fix=()=>{ try{ map.invalidateSize(true) }catch{} }
      fix(); setTimeout(fix,150); setTimeout(fix,600)
      setReady(true)
    }
    init()
    return()=>{ if(map) try{ map.remove() }catch{} }
  },[])

  return(
    <div style={{display:'flex',flexDirection:'column',width:'100vw',height:'100vh',background:'#3d2800',overflow:'hidden'}}>
      <Header/>
      <div style={{height:100%,flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center',background:'#a67c00',padding:'0 16px'}}>
        <h1 style={{color:'white',fontWeight:900,margin:0,fontSize:16}}>BLOCK MAP • 95122 • 3 PINS • LIVE {ready?'':'• Loading...'}</h1>
        <Link href="/feed" style={{background:'white',color:'black',padding:'6px 16px',borderRadius:999,textDecoration:'none',fontWeight:900}}>← Back</Link>
      </div>
      {/* 100% WRAPPER */}
      <div style={{flex:1,width:'100%',height:'100%',position:'relative',overflow:'hidden'}}>
        <div id="block-map" style={{width:'100%',height:'100%',position:'absolute',top:0,left:0,right:0,bottom:0}}/>
      </div>
    </div>
  )
}
