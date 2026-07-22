'use client'
import { MapContainer, TileLayer } from 'react-leaflet'

export default function MapClient(){
  return (
    <MapContainer 
      center={[37.3382, -121.8863]} 
      zoom={13} 
      style={{height:'100vh', width:'100vw', position:'absolute', top:0, left:0}}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    </MapContainer>
  )
}
