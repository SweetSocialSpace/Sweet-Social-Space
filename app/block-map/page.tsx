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
function tileToLatLon(x:number, y:number, zoom:number){
  const n = Math.pow(2, zoom)
  const lon = x/n*360-180
  const lat = Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI
  return {lat, lon}
}

export default function BlockMapPage(){
  const { zip } = useLocation()
  const [zoom, setZoom] = useState(15)
  const [center, setCenter] = useState({lat:37.3448, lon:-121.8565})
  const [pins, setPins] = useState([
    {id:'story', lat:37.3448, lon:-121.8565, label:'📍 Story & King', color:'#dc2626'},
    {id:'tacos', lat:37.3435, lon:-121.8575, label:'🌮 Tacos', color:'#2563eb'},
    {id:'sale', lat:37.3465, lon:-121.8540, label:'🏷️ Sale', color:'#16a34a'},
  ])
  const dragRef = useRef<any>(null)
  const pinDragRef = useRef<any>(null)

  const centerTile = latLonToTileFloat(center.lat, center.lon, zoom)
  const cx = Math.floor(centerTile.x), cy = Math.floor(centerTile.y)
  const tiles = []
  for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) tiles.push({x:cx+dx, y:cy+dy})

  const getPos = (lat:number, lon:number) => {
    const p = latLonToTileFloat(lat, lon, zoom)
    return {left:`${50 + (p.x-centerTile.x)*33.333}%`, top:`${50 + (p.y-centerTile.y)*33.333}%`}
  }

  const handleMapMouseMove = (e:React.MouseEvent) => {
    if(pinDragRef.current){
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const xPct = (e.clientX-rect.left)/rect.width
      const yPct = (e.clientY-rect.top)/rect.height
      // convert % to tile coords
      const tileX = (cx-1) + xPct*3
      const tileY = (cy-1) + yPct*3
      const {lat, lon} = tileToLatLon(tileX, tileY, zoom)
      setPins(ps=>ps.map(p=>p.id===pinDragRef.current ? {...p, lat, lon} : p))
      return
    }
    if(!dragRef.current) return
    const dx=e.clientX-dragRef.current.sx, dy=e.clientY-dragRef.current.sy
    const s=Math.pow(2,-zoom)*2
    setCenter({lat:dragRef.current.lat+dy*s*0.5, lon:dragRef.current.lon-dx*s*0.5})
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'radial-gradient(circle at top, #a67c00, #3d2800)'}}>
      <Header />
      <div style={{flex:'0 0 auto', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900}}>BLOCK MAP • {zip || '95122'} • DRAG PINS TO CORNER</h1>
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <button onClick={()=>setZoom(z=>Math.max(11,z-1))} style={{background:'white', color:'black', width:'36px', height:'36px', borderRadius:'50%', fontWeight:900, border:'none', cursor:'pointer'}}>−</button>
          <span style={{color:'white', fontSize:'12px', fontWeight:700, width:'30px', textAlign:'center'}}>{zoom}x</span>
          <button onClick={()=>setZoom(z=>Math.min(16,z+1))} style={{background:'white', color:'black', width:'36px', height:'36px', borderRadius:'50%', fontWeight:900, border:'none', cursor:'pointer'}}>+</button>
          <Link href="/feed" style={{background:'white', color:'black', fontWeight:900, padding:'8px 20px', borderRadius:'999px', textDecoration:'none', marginLeft:'12px'}}>← Back to Feed</Link>
        </div>
      </div>
      <div 
        onWheel={(e)=>{e.preventDefault(); setZoom(z=> e.deltaY<0 ? Math.min(16,z+1) : Math.max(11,z-1))}}
        onMouseDown={(e)=> dragRef.current={sx:e.clientX, sy:e.clientY, lat:center.lat, lon:center.lon}}
        onMouseMove={handleMapMouseMove}
        onMouseUp={()=>{dragRef.current=null; pinDragRef.current=null}}
        onMouseLeave={()=>{dragRef.current=null; pinDragRef.current=null}}
        style={{flex:'1 1 auto', margin:'0 16px 16px 16px', borderRadius:'16px', overflow:'hidden', position:'relative', background:'white', minHeight:0, cursor:'grab'}}
      >
        <div style={{position:'absolute', inset:0, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gridTemplateRows:'repeat(3, 1fr)'}}>
          {tiles.map((t,i)=><img key={i} src={`https://a.tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" draggable={false} />)}
        </div>
        {pins.map(pin=>{
          const pos = getPos(pin.lat, pin.lon)
          return (
            <button 
              key={pin.id}
              onMouseDown={(e)=>{e.stopPropagation(); pinDragRef.current=pin.id}}
              onClick={()=>{if(!pinDragRef.current) window.open(`https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lon}`,'_blank')}}
              style={{position:'absolute', left:pos.left, top:pos.top, transform:'translate(-50%,-50%)', background:pin.color, color:'white', fontWeight:900, padding:'6px 12px', borderRadius:'999px', fontSize:'12px', border:'none', cursor:'grab', boxShadow:'0 4px 12px rgba(0,0,0,0.5)', whiteSpace:'nowrap'}}
            >{pin.label}</button>
          )
        })}
        <div style={{position:'absolute', bottom:'10px', left:'10px', background:'rgba(0,0,0,0.8)', color:'white', fontSize:'11px', padding:'6px 10px', borderRadius:'8px', pointerEvents:'none'}}>DRAG a pin to the real intersection • Scroll = zoom • Drag map = pan • Click pin = directions</div>
      </div>
    </div>
  )
}
