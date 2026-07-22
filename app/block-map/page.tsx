'use client'
import { useState, useRef } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'

function toTile(lat:number, lon:number, z:number){
  return {
    x: (lon+180)/360 * Math.pow(2,z),
    y: (1 - Math.log(Math.tan(lat*Math.PI/180)+1/Math.cos(lat*Math.PI/180))/Math.PI)/2 * Math.pow(2,z)
  }
}

export default function BlockMapPage(){
  const [zoom, setZoom] = useState(15)
  const [center, setCenter] = useState({lat:37.3397, lon:-121.8545})
  const [offset, setOffset] = useState({x:0, y:0})
  const drag = useRef<any>(null)

  const cTile = toTile(center.lat, center.lon, zoom)
  const cx = Math.floor(cTile.x), cy = Math.floor(cTile.y)
  const tiles=[]
  for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) tiles.push({x:cx+dx, y:cy+dy})

  const pins = [
    {lat:37.3397, lng:-121.8545, label:'📍 Story & King', color:'#dc2626'},
    {lat:37.3385, lng:-121.8535, label:'🌮 Tacos', color:'#2563eb'},
    {lat:37.3410, lng:-121.8555, label:'🏷️ Sale', color:'#16a34a'},
  ]

  const endDrag = () => {
    if(!drag.current) return
    const s = Math.pow(2, -zoom) * 1.2
    setCenter({lat: center.lat + offset.y * s * 0.3, lon: center.lon - offset.x * s * 0.3})
    setOffset({x:0,y:0})
    drag.current=null
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'#3d2800'}}>
      <Header />
      <div style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', background:'#a67c00', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900, margin:0, fontSize:'16px'}}>BLOCK MAP • 95122 • 3 PINS • LIVE</h1>
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <button onClick={()=>setZoom(z=>Math.max(12,z-1))} style={{width:'32px', height:'32px', borderRadius:'50%', border:'none', fontWeight:900, cursor:'pointer'}}>−</button>
          <span style={{color:'white', width:'28px', textAlign:'center'}}>{zoom}</span>
          <button onClick={()=>setZoom(z=>Math.min(18,z+1))} style={{width:'32px', height:'32px', borderRadius:'50%', border:'none', fontWeight:900, cursor:'pointer'}}>+</button>
          <Link href="/feed" style={{background:'white', color:'black', padding:'6px 16px', borderRadius:'999px', textDecoration:'none', fontWeight:900, marginLeft:'8px'}}>← Back</Link>
        </div>
      </div>

      <div
        onMouseDown={e=> drag.current={sx:e.clientX, sy:e.clientY}}
        onMouseMove={e=>{ if(!drag.current) return; setOffset({x:e.clientX-drag.current.sx, y:e.clientY-drag.current.sy}) }}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onWheel={e=>{ e.preventDefault(); setZoom(z=> e.deltaY<0 ? Math.min(18,z+1) : Math.max(12,z-1)) }}
        style={{flex:1, margin:'12px', borderRadius:'16px', overflow:'hidden', position:'relative', background:'#ddd', cursor:'grab'}}
      >
        {/* SINGLE layer that moves together - no lag */}
        <div style={{position:'absolute', left:'-50%', top:'-50%', width:'200%', height:'200%', transform:`translate(${offset.x}px, ${offset.y}px)`}}>
          <div style={{position:'absolute', inset:'25%', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'repeat(3,1fr)'}}>
            {tiles.map((t,i)=><img key={i} src={`https://a.tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} draggable={false} />)}
          </div>
          {pins.map((p,i)=>{
            const pt = toTile(p.lat, p.lng, zoom)
            const left = 50 + (pt.x - cTile.x)*33.333
            const top = 50 + (pt.y - cTile.y)*33.333
            return <a key={i} href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" style={{position:'absolute', left:`${left}%`, top:`${top}%`, transform:'translate(-50%,-50%)', background:p.color, color:'white', padding:'6px 12px', borderRadius:'999px', fontWeight:900, fontSize:'12px', textDecoration:'none', boxShadow:'0 4px 10px rgba(0,0,0,.5)'}}>{p.label}</a>
          })}
        </div>
      </div>
    </div>
  )
}
