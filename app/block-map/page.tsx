'use client'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

export default function BlockMapPage(){
  useEffect(()=>{
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  },[])

  const Map = dynamic(()=> import('./MapClient'), { ssr:false })

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh'}}>
      <Map />
      <a href="/" style={{position:'absolute', top:16, left:16, zIndex:1000, background:'black', color:'white', padding:'8px 16px', borderRadius:8, textDecoration:'none'}}>← Back to Sweet Social Space</a>
    </div>
  )
}
