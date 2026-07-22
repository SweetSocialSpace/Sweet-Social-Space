'use client'
import { useEffect, useRef } from 'react'

export default function BlockMapPage(){
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const css=document.createElement('link')
    css.rel='stylesheet'
    css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    
    const s=document.createElement('style')
    s.innerHTML=`
      html, body { margin:0 !important; padding:0 !important; height:100% !important; overflow:hidden !important; }
      #map, #map .leaflet-container { width:100% !important; height:100% !important; }
      .leaflet-tile { max-width:none !important; }
    `
    document.head.appendChild(s)

    let map:any
    const init=async()=>{
      const L=await import('leaflet')
      if(!ref.current) return
      if((ref.current as any)._leaflet_id) ref.current.innerHTML=''
      map=L.map(ref.current,{center:[37.3396,-121.8611],zoom:15,scrollWheelZoom:true})
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      
      // Real markers - locked to map
      L.marker([37.3396,-121.8611]).addTo(map).bindPopup('Story & King')
      
      setTimeout(()=>map.invalidateSize(true),100)
      setTimeout(()=>map.invalidateSize(true),500)
    }
    init()
    return()=>{ if(map) try{map.remove()}catch{} }
  },[])
  
  return(
    <div style={{width:'100vw',height:'100vh',position:'fixed',top:0,left:0,zIndex:10}}>
      <div ref={ref} id="map" style={{width:'100%',height:'100%'}} />
    </div>
  )
}
