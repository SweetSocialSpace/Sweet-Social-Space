'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/utils/supabase/client'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FixSize(){
  const map = useMap()
  useEffect(()=>{ setTimeout(()=> map.invalidateSize(), 150)},[map])
  return null
}

export default function MapClient(){
  const [pins, setPins] = useState<any[]>([])
  const supabase = createClient()

  useEffect(()=>{
    const load = async () => {
      const { data } = await supabase.from('block_businesses').select('*').limit(200)
      if(data) setPins(data)
    }
    load()
  },[])

  return (
    <MapContainer center={[37.3382, -121.8863]} zoom={12} style={{height:'100vh', width:'100vw'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FixSize />
      {pins.map((b)=>(
        <Marker key={b.id} position={[b.lat, b.lng]}>
          <Popup>
            <strong>{b.business_name}</strong><br/>
            {b.address}<br/>
            <em>{b.description}</em><br/><br/>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`} target="_blank" style={{background:'black', color:'white', padding:'6px 12px', borderRadius:6, textDecoration:'none'}}>Get Directions</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
