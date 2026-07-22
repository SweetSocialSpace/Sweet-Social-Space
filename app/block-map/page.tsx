'use client'
import { useEffect, useState } from 'react'

export default function BlockMapPage(){
  return (
    <div style={{
      position:'fixed',
      top:0,
      left:0,
      width:'100vw',
      height:'100vh',
      zIndex:10
    }}>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-121.9%2C37.3%2C-121.8%2C37.4&layer=mapnik"
        style={{width:'100%', height:'100%', border:'none'}}
      />
      {/* Back button */}
      <a href="/" style={{
        position:'absolute',
        top:'16px',
        left:'16px',
        background:'black',
        color:'white',
        padding:'8px 16px',
        borderRadius:'8px',
        textDecoration:'none',
        fontSize:'14px'
      }}>← Back to Sweet Social Space</a>
    </div>
  )
}
