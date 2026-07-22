'use client'
import { useEffect, useRef } from 'react'

export default function BlockMapPage(){
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const link=document.createElement('link')
    link.rel='stylesheet'
    link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    
    let map:any
    const init=async()=>{
      const L=await import('leaflet')
      if(!ref.current) return
      map=L.map(ref.current,{center:[37.3396,-121.8611],zoom:15})
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      L.marker([37.3396,-121.8611]).addTo(map)
      setTimeout(()=>map.invalidateSize(true),300)
    }
    init()
    return()=>{ if(map) try{map.remove()}catch{} }
  },[])
  
  return <div ref={ref} style={{width:'100vw',height:'100vh'}} />
}
