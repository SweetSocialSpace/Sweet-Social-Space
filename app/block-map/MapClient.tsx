'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/utils/supabase/client'

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [0, -50],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FixSize(){ const map=useMap(); useEffect(()=>{setTimeout(()=>map.invalidateSize(),200)},[map]); return null }

export default function MapClient(){
  const [pins,setPins]=useState<any[]>([])
  const supabase=createClient()
  useEffect(()=>{ (async()=>{ const {data}=await supabase.from('block_businesses').select('*'); if(data) setPins(data) })() },[])

  return(
    <MapContainer center={[37.3369,-121.8563]} zoom={15} style={{height:'100vh', width:'100vw'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FixSize />
      {pins.map(b=>(
        <Marker
          key={b.id}
          position={[b.lat,b.lng]}
          icon={icon}
          eventHandlers={{
            mouseover: (e)=> e.target.openPopup(),
            click: (e)=> e.target.openPopup()
          }}
        >
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
    </MapContainer>
  )
}
