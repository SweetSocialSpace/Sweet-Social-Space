'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/utils/supabase/client'
import { useLocation } from '@/lib/location-context'

const normalIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [0, -50],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [0, -50],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  className: 'gold-pulse'
})

function FixSize(){ const map=useMap(); useEffect(()=>{setTimeout(()=>map.invalidateSize(),200)},[map]); return null }

function Recenter({ coords }: { coords: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.setView(coords) }, [coords, map])
  return null
}

export default function MapClient(){
  const [pins,setPins]=useState<any[]>([])
  const [lostPets,setLostPets]=useState<any[]>([])
  const supabase=createClient()
  const { zip, coords: userCoords } = useLocation()

  // GLOBAL FIX: Center on USER, not 95122
  // Old: [37.3369,-121.8563] = 95122 forever
  // New: User's location or fallback
  const mapCenter: [number, number] = userCoords? [userCoords.lat, userCoords.lng] : [37.3369,-121.8563]

  useEffect(()=>{
    (async()=>{
      const {data: biz}=await supabase.from('block_businesses').select('*')
      if(biz) setPins(biz)

      // GOLD PINS: Lost pets last 48hrs
      const {data: pets}=await supabase.from('posts').select('*').ilike('category','%lost_pet%').order('created_at',{ascending:false}).limit(20)
      if(pets){
        const fresh = pets.filter((p:any) => Date.now() - new Date(p.created_at).getTime() < 48*60*60*1000)
        setLostPets(fresh)
      }
    })()
  },[])

  return(
    <div>
      <style>{`.gold-pulse { filter: drop-shadow(0 0 8px gold); animation: pulse 1.5s infinite; } @keyframes pulse { 0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }`}</style>
      <div className="absolute top-2 left-12 z-[1000] bg-black text-white px-3 py-1 rounded-full text-xs font-black">📍 {zip || 'YOUR BLOCK'} • {pins.length + lostPets.length} LIVE PINS</div>
      <MapContainer center={mapCenter} zoom={15} style={{height:'100vh', width:'100vw'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FixSize />
        <Recenter coords={mapCenter} />
        {pins.map(b=>(
          <Marker key={`biz-${b.id}`} position={[b.lat,b.lng]} icon={normalIcon}>
            <Popup>
              <div style={{minWidth:150}}>
                <strong style={{fontSize:16}}>{b.business_name}</strong><br/>
                {b.address}<br/>
                <div style={{marginTop:8}}>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`} target="_blank" style={{background:'black',color:'white',padding:8,borderRadius:6,textDecoration:'none', display:'inline-block'}}>Get Directions</a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {lostPets.map(p=>(
          <Marker key={`lost-${p.id}`} position={[p.lat || mapCenter[0]+0.001, p.lng || mapCenter[1]+0.001]} icon={goldIcon}>
            <Popup>
              <div style={{minWidth:180, border:'3px solid gold', borderRadius:12, padding:10}}>
                <div style={{background:'gold', color:'black', fontWeight:900, padding:'4px 8px', borderRadius:20, display:'inline-block', fontSize:10, marginBottom:6}}>⭐ PINNED 48HR • LOST PET</div>
                <div style={{fontWeight:900}}>{p.body?.slice(0,100)}</div>
                <div style={{fontSize:12, color:'#666', marginTop:6}}>{new Date(p.created_at).toLocaleString()} • {zip}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
