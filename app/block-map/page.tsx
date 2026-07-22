'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(()=> import('./MapClient'), { ssr:false })

export default function BlockMapPage(){
  return (
    <div style={{position:'fixed', inset:0, width:'100vw', height:'100vh'}}>
      <Map />
      <a href="/" style={{position:'absolute', top:16, right:16, zIndex:1000, background:'black', color:'white', padding:'10px 18px', borderRadius:999, textDecoration:'none', fontWeight:'bold', boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}>← Back to Sweet Social Space</a>
    </div>
  )
}
