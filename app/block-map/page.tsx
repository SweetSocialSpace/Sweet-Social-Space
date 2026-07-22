'use client'
import { useState } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

function latLonToTile(lat:number, lon:number, zoom:number){
  const x = Math.floor((lon+180)/360 * Math.pow(2, zoom))
  const y = Math.floor((1 - Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 * Math.pow(2, zoom))
  return {x,y}
}

export default function BlockMapPage(){
  const { zip } = useLocation()
  const [zoom, setZoom] = useState(13)
  const center = {lat:37.335, lon:-121.855}
  const {x,y} = latLonToTile(center.lat, center.lon, zoom)

  const tiles = []
  for(let dy=-1; dy<=1; dy++){
    for(let dx=-1; dx<=1; dx++){
      tiles.push({x:x+dx, y:y+dy})
    }
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'radial-gradient(circle at top, #a67c00, #3d2800)'}}>
      <Header />
      <div style={{flex:'0 0 auto', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900}}>BLOCK MAP • {zip || '95122'} • 3 PINS • LIVE</h1>
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <button onClick={()=>setZoom(z=>Math.max(11,z-1))} style={{background:'white', width:'36px', height:'36px', borderRadius:'50%', fontWeight:900, fontSize:'20px', border:'none'}}>−</button>
          <span style={{color:'white', fontSize:'12px', fontWeight:700, width:'30px', textAlign:'center'}}>{zoom}x</span>
          <button onClick={()=>setZoom(z=>Math.min(16,z+1))} style={{background:'white', width:'36px', height:'36px', borderRadius:'50%', fontWeight:900, fontSize:'20px', border:'none'}}>+</button>
          <Link href="/feed" style={{background:'white', color:'black', fontWeight:900, padding:'8px 20px', borderRadius:'999px', textDecoration:'none', marginLeft:'12px'}}>← Back to Feed</Link>
        </div>
      </div>

      <div style={{flex:'1 1 auto', margin:'0 16px 16px 16px', borderRadius:'16px', overflow:'hidden', position:'relative', background:'white', minHeight:0}}>
        <div style={{position:'absolute', inset:0, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gridTemplateRows:'repeat(3, 1fr)'}}>
          {tiles.map((t,i)=>(
            <img key={i} src={`https://a.tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          ))}
        </div>
        <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#dc2626', color:'white', fontWeight:900, padding:'6px 14px', borderRadius:'999px', fontSize:'13px', boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}>📍 Story & King</div>
        <div style={{position:'absolute', top:'58%', left:'42%', background:'#2563eb', color:'white', fontWeight:900, padding:'4px 10px', borderRadius:'999px', fontSize:'11px'}}>🌮 Tacos</div>
        <div style={{position:'absolute', top:'38%', left:'62%', background:'#16a34a', color:'white', fontWeight:900, padding:'4px 10px', borderRadius:'999px', fontSize:'11px'}}>🏷️ Sale</div>
      </div>
    </div>
  )
}
