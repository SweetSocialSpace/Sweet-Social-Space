'use client'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function BlockMapPage(){
  const { zip } = useLocation()
  return (
    <div style={{display:'flex', flexDirection:'column', height:'100dvh', width:'100vw', background:'radial-gradient(circle at top, #a67c00, #3d2800)'}}>
      <Header />
      
      <div style={{flex:'0 0 auto', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'white', fontWeight:900, fontSize:'clamp(16px, 2vw, 24px)'}}>BLOCK MAP • {zip || '95122'} • LIVE</h1>
        <Link href="/feed" style={{background:'white', color:'black', fontWeight:900, padding:'8px 20px', borderRadius:'999px', textDecoration:'none', fontSize:'clamp(12px, 1.5vw, 14px)'}}>← Back to Feed</Link>
      </div>

      {/* THIS AUTO-FILLS WHATEVER DISPLAY - phone, monitor, 4K */}
      <div style={{flex:'1 1 auto', margin:'0 16px 16px 16px', background:'white', borderRadius:'16px', overflow:'hidden', position:'relative', minHeight:0}}>
        
        {/* Map tiles fill 100% of this container */}
        <div style={{position:'absolute', inset:0, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gridTemplateRows:'repeat(3, 1fr)'}}>
          <img src="https://a.tile.openstreetmap.org/13/1307/3159.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1308/3159.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1309/3159.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1307/3160.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1308/3160.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1309/3160.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1307/3161.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1308/3161.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
          <img src="https://a.tile.openstreetmap.org/13/1309/3161.png" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
        </div>

        <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#dc2626', color:'white', fontWeight:900, padding:'8px 16px', borderRadius:'999px', fontSize:'clamp(10px, 1.5vw, 14px)', whiteSpace:'nowrap'}}>📍 Story & King • 95122</div>
      </div>
    </div>
  )
}
