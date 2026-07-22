'use client'
import Header from '@/app/components/Header'
import Link from 'next/link'

export default function BlockMapPage(){
  // Real Story & King = Story Rd & King Rd, 95122
  // 37.3389, -121.8547 is the actual corner by the 76 station
  const lat = 37.3389
  const lon = -121.8547
  
  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'#3d2800'}}>
      <Header />
      <div style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#a67c00'}}>
        <h1 style={{color:'white', fontWeight:900, margin:0}}>BLOCK MAP • 95122 • 3 PINS • LIVE</h1>
        <Link href="/feed" style={{background:'white', color:'black', fontWeight:900, padding:'8px 20px', borderRadius:'999px', textDecoration:'none'}}>← Back to Feed</Link>
      </div>
      
      <div style={{flex:1, position:'relative'}}>
        <iframe
          width="100%"
          height="100%"
          style={{border:0}}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=-121.8697%2C37.3309%2C-121.8397%2C37.3469&layer=mapnik&marker=${lat}%2C${lon}`}
          title="Story & King Map"
        />
        {/* Clickable overlay for the other 2 pins - they open Google Maps */}
        <a href="https://www.google.com/maps/search/?api=1&query=37.3389,-121.8547" target="_blank" style={{position:'absolute', top:'48%', left:'49%', background:'#dc2626', color:'white', padding:'6px 14px', borderRadius:'999px', fontWeight:900, textDecoration:'none', transform:'translate(-50%,-50%)', boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}>📍 Story & King</a>
        <a href="https://www.google.com/maps/search/?api=1&query=37.3375,-121.8535" target="_blank" style={{position:'absolute', top:'55%', left:'46%', background:'#2563eb', color:'white', padding:'5px 12px', borderRadius:'999px', fontWeight:900, fontSize:'12px', textDecoration:'none', transform:'translate(-50%,-50%)', boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}>🌮 Tacos</a>
        <a href="https://www.google.com/maps/search/?api=1&query=37.3405,-121.8520" target="_blank" style={{position:'absolute', top:'42%', left:'54%', background:'#16a34a', color:'white', padding:'5px 12px', borderRadius:'999px', fontWeight:900, fontSize:'12px', textDecoration:'none', transform:'translate(-50%,-50%)', boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}>🏷️ Sale</a>
      </div>
    </div>
  )
}
