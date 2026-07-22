'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(()=> import('./MapClient'), { ssr:false })

export default function BlockMapPage(){
  return (
    <div style={{position:'fixed', inset:0, width:'100vw', height:'100vh'}}>
      <Map />
      <a href="/" style={{position:'absolute', top:16, left:16, zIndex:1000, background:'black', color:'white', padding:'8px 16px', borderRadius:8, textDecoration:'none'}}>← Back to Sweet Social Space</a>
    </div>
  )
}
