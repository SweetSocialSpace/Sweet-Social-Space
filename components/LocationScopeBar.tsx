'use client'
import { useState, useEffect } from 'react'

export function LocationScopeBar(){
  const [zip, setZip] = useState('95122')
  const [scope, setScope] = useState('10 mi')
  const [locating, setLocating] = useState(false)

  useEffect(()=>{
    const saved = localStorage.getItem('sss_zip')
    if(saved) setZip(saved)
  },[])

  const useMyLocation = ()=>{
    setLocating(true)
    if(!navigator.geolocation){ setLocating(false); return }
    navigator.geolocation.getCurrentPosition(
      async (pos)=>{
        // Simple — just keep 95122 for now, but you can add reverse geocode later
        setZip('95122')
        localStorage.setItem('sss_zip','95122')
        setLocating(false)
      },
      ()=> setLocating(false)
    )
  }

  return (
    <div className="flex items-center justify-between text-white text-xs mb-4">
      <div className="flex items-center gap-2">
        <span className="bg-white/10 px-3 py-1.5 rounded-full font-bold">NEAR: {zip}</span>
        <select value={scope} onChange={e=>setScope(e.target.value)} className="bg-white/10 px-3 py-1.5 rounded-full border-0 text-white outline-none">
          <option className="text-black">5 mi</option>
          <option className="text-black">10 mi</option>
          <option className="text-black">20 mi</option>
          <option className="text-black">50 mi</option>
        </select>
      </div>
      <button onClick={useMyLocation} className="bg-white text-black px-3 py-1.5 rounded-full font-bold text-">
        {locating? 'Locating...' : 'Use my location'}
      </button>
    </div>
  )
}

export default LocationScopeBar
