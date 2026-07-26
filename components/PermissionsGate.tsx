'use client'
import { useState } from 'react'

export default function PermissionsGate(){
  const [done, setDone] = useState(false)
  if(typeof window!== 'undefined' && localStorage.getItem('sss_v4')) return null
  if(done) return null

  async function enableAll(){
    // 1. FORCE CAMERA WINDOW - this makes Chrome open "sweetsocialspace.com wants to use your camera [Allow]"
    try{
      const cam = await navigator.mediaDevices.getUserMedia({video:true})
      cam.getTracks().forEach(t=>t.stop())
    }catch{}

    // 2. FORCE MICROPHONE WINDOW - "wants to use your microphone [Allow]"
    try{
      const mic = await navigator.mediaDevices.getUserMedia({audio:true})
      mic.getTracks().forEach(t=>t.stop())
    }catch{}

    // 3. FORCE LOCATION WINDOW - "wants to know your location [Allow]"
    try{
      await new Promise((res, rej)=> navigator.geolocation.getCurrentPosition(res, rej))
    }catch{}

    // After they click Allow 3 times, never ask again
    localStorage.setItem('sss_v4','1')
    setDone(true)
    window.location.reload()
  }

  return(
    <div style={{position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#111', border:'1px solid #333', borderRadius:16, padding:24, width:360}}>
        <h2 style={{color:'white', fontWeight:900}}>Enable Your Block</h2>
        <p style={{color:'#aaa', fontSize:12, marginTop:8}}>Tap below - your browser will ask you 3 times to Allow - just like Facebook does.</p>
        <button onClick={enableAll} style={{marginTop:16, width:'100%', background:'white', color:'black', fontWeight:900, padding:16, borderRadius:12}}>ENABLE - START 95122</button>
      </div>
    </div>
  )
}
