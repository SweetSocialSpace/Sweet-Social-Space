'use client'
import { useState, useRef } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

function latLonToTileFloat(lat:number, lon:number, zoom:number){
  const x = (lon+180)/360 * Math.pow(2, zoom)
  const y = (1 - Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 * Math.pow(2, zoom)
  return {x,y}
}
const PINS = [
  {id:'story', lat:37.3422, lon:-121.8570, label:'📍 Story & King', color:'#dc2626'},
  {id:'tacos', lat:37.3405, lon:-121.8562, label:'🌮 Tacos', color:'#2563eb'},
  {id:'sale', lat:37.3445, lon:-121.8515, label:'🏷️ Sale', color:'#16a34a'},
]

export default function BlockMapPage(){
  const { zip } = useLocation()
  const [zoom, setZoom] = useState(13)
  const [center, setCenter] = useState({lat:37.3422, lon:-121.8570})
  const dragRef = useRef<any>(null)

  const centerTile = latLonToTileFloat(center.lat, center.lon, zoom)
  const tiles = []
  const cx = Math.floor(centerTile.x), cy = Math.floor(centerTile.y)
  for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) tiles.push({x:cx+dx, y:cy+dy})

  const getPinPos = (lat:number, lon:number) => {
    const p = latLonToTileFloat(lat, lon, zoom)
    const dx = p.x - centerTile.x
    const dy = p.y - centerTile.y
    // 1 tile = 33.333% of container
    const left = 50 + dx * 33.333
    const top = 50 + dy * 33.333
    return {left:`${left}%`, top:`${top}%`}
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'radial-gradient(circle at top, #a67c00, #3d2800)'}}>
      <Header />
      <div style={{flex:'0 0 auto', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900}}>BLOCK MAP • {zip || '95122'} • 3 PINS • LIVE</h1>
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <button onClick={()=>setZoom(z=>Math.max(11,z-1))} style={{background:'white', color:'black', width:'36px', height:'36px', borderRadius:'50%', fontWeight:900, fontSize:'20px', border:'none', cursor:'pointer'}}>−</button>
          <span style={{color:'white', fontSize:'12px', fontWeight:700, width:'30px', textAlign:'center'}}>{zoom}x</span>
          <button onClick={()=>setZoom(z=>Math.min(16,z+1))} style={{background:'white', color:'black', width:'36px', height:'36px', borderRadius:'50%', fontWeight:900, fontSize:'20px', border:'none', cursor:'pointer'}}>+</button>
          <Link href="/feed" style={{background:'white', color:'black', fontWeight:900, padding:'8px 20px', borderRadius:'999px', textDecoration:'none', marginLeft:'12px'}}>← Back to Feed</Link>
        </div>
      </div>

      <div 
        onWheel={(e)=>{e.preventDefault(); setZoom(z=> e.deltaY<0 ? Math.min(16,z+1) : Math.max(11,z-1))}}
        onMouseDown={(e)=> dragRef.current={sx:e.clientX, sy:e.clientY, lat:center.lat, lon:center.lon}}
        onMouseMove={(e)=>{ if(!dragRef.current) return; const dx=e.clientX-dragRef.current.sx, dy=e.clientY-dragRef.current.sy; const s=Math.pow(2,-zoom)*2; setCenter({lat:dragRef.current.lat+dy*s*0.5, lon:dragRef.current.lon-dx*s*0.5}) }}
        onMouseUp={()=>dragRef.current=null}
        onMouseLeave={()=>dragRef.current=null}
        style={{flex:'1 1 auto', margin:'0 16px 16px 16px', borderRadius:'16px', overflow:'hidden', position:'relative', background:'white', minHeight:0, cursor:'grab'}}
      >
        <div style={{position:'absolute', inset:0, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gridTemplateRows:'repeat(3, 1fr)'}}>
          {tiles.map((t,i)=><img key={i} src={`https://a.tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" draggable={false} />)}
        </div>

        {PINS.map(pin=>{
          const pos = getPinPos(pin.lat, pin.lon)
          return (
            <button 
              key={pin.id}
              onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lon}`,'_blank')}
              style={{position:'absolute', left:pos.left, top:pos.top, transform:'translate(-50%,-50%)', background:pin.color, color:'white', fontWeight:900, padding:'6px 12px', borderRadius:'999px', fontSize:'12px', border:'none', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.5)', whiteSpace:'nowrap'}}
            >{pin.label}</button>
          )
        })}
      </div>
    </div>
  )
}
