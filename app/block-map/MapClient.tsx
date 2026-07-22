'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function FixSize(){
  const map = useMap()
  useEffect(()=>{
    setTimeout(()=> map.invalidateSize(), 100)
  },[map])
  return null
}

export default function MapClient(){
  return (
    <MapContainer
      center={[37.3382, -121.8863]}
      zoom={13}
      style={{height:'100vh', width:'100vw'}}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FixSize />
    </MapContainer>
  )
}
