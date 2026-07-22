'use client'
import { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'

function latLonToTile(lat:number, lon:number, z:number){
  const n = Math.pow(2, z)
  return {
    x: (lon + 180) / 360 * n,
    y: (1 - Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 * n
  }
}

export default function BlockMapPage(){
  const [zoom, setZoom] = useState(15)
  const [center, setCenter] = useState({lat:37.3397, lon:-121.8545}) // 95122 - Story & King
  const [pan, setPan] = useState({x:0, y:0})
  const dragRef = useRef<{startX:number, startY:number, origPan:any} | null>(null)

  const cTile = useMemo(()=> latLonToTile(center.lat, center.lon, zoom), [center, zoom])
  
  // Generate 3x3 grid around center
  const tiles = useMemo(()=>{
    const list=[]
    const cx = Math.floor(cTile.x), cy = Math.floor(cTile.y)
    for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) list.push({x:cx+dx, y:cy+dy})
    return list
  },[cTile])

  const pins = [
    {lat:37.3402, lng:-121.8569, label:'📍 Story & King', color:'#dc2626'},
    {lat:37.3385, lng:-121.8535, label:'🌮 Tacos', color:'#2563eb'},
    {lat:37.3410, lng:-121.8555, label:'🏷 Sale', color:'#16a34a'},
  ]

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    dragRef.current = {startX:e.clientX, startY:e.clientY, origPan:{...pan}}
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if(!dragRef.current) return
    setPan({
      x: dragRef.current.origPan.x + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origPan.y + (e.clientY - dragRef.current.startY)
    })
  }
  const onPointerUp = () => {
    if(!dragRef.current) return
    // Commit pan to center
    const scale = 360 / Math.pow(2, zoom) / 256 // rough deg per pixel
    setCenter(c => ({
      lat: c.lat - pan.y * scale,
      lon: c.lon - pan.x * scale
    }))
    setPan({x:0,y:0})
    dragRef.current = null
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', background:'#3d2800'}}>
      <Header />
      <div style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', background:'#a67c00'}}>
        <h1 style={{color:'white', fontWeight:900, margin:0}}>BLOCK MAP • 95122 • {pins.length} PINS • LIVE</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={()=>setZoom(z=>Math.max(12,z-1))} style={{width:32, height:32, borderRadius:999, border:'none', fontWeight:900}}>−</button>
          <span style={{color:'white', width:28, textAlign:'center'}}>{zoom}</span>
          <button onClick={()=>setZoom(z=>Math.min(18,z+1))} style={{width:32, height:32, borderRadius:999, border:'none', fontWeight:900}}>+</button>
          <Link href="/feed" style={{background:'white', color:'black', padding:'6px 16px', borderRadius:999, textDecoration:'none', fontWeight:900}}>← Back</Link>
        </div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{flex:1, margin:12, borderRadius:16, overflow:'hidden', position:'relative', background:'#ddd', touchAction:'none'}}
      >
        <div style={{position:'absolute', inset:0, transform:`translate(${pan.x}px, ${pan.y}px)`}}>
          <div style={{position:'absolute', left:'-50%', top:'-50%', width:'200%', height:'200%', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'repeat(3,1fr)'}}>
            {tiles.map((t,i)=>(
              <img key={i} src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`} alt="" style={{width:'100%', height:'100%'}} draggable={false} />
            ))}
          </div>
          {pins.map((p,i)=>{
            const pt = latLonToTile(p.lat, p.lng, zoom)
            const left = 50 + (pt.x - cTile.x)*33.333
            const top = 50 + (pt.y - cTile.y)*33.333
            return (
              <a key={i} href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank"
                style={{position:'absolute', left:`${left}%`, top:`${top}%`, transform:'translate(-50%,-100%)', background:p.color, color:'white', padding:'6px 12px', borderRadius:999, fontWeight:900, fontSize:12, textDecoration:'none', boxShadow:'0 4px 10px rgba(0,0,0,.5)'}}>
                {p.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
