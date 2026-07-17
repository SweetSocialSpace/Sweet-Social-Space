'use client'
import { useState } from 'react'

export function LocationScopeBar({ zip, radius, setRadius }: { zip: string, radius: number, setRadius: (n:number)=>void }){
  const [loc, setLoc] = useState('Use my location')
  
  const handleLoc = ()=>{
    if(navigator.geolocation){
      setLoc('Locating...')
      navigator.geolocation.getCurrentPosition(
        ()=> setLoc('95122 • San Jose'),
        ()=> setLoc('95122 (default)'),
        {timeout: 5000}
      )
    }
  }

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-bold">NEAR: {zip}</span>
        <select value={radius} onChange={e=>setRadius(Number(e.target.value))} className="bg-white text-black text-xs font-bold rounded-full px-3 py-1">
          <option value={5}>5 mi</option>
          <option value={10}>10 mi</option>
          <option value={25}>25 mi</option>
        </select>
      </div>
      <button onClick={handleLoc} style={{color:'black'}} className="bg-white text-black text-xs font-black rounded-full px-4 py-1.5">
        {loc}
      </button>
    </div>
  )
}
