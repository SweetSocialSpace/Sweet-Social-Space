'use client'
import { useState } from 'react'

export default function PermissionsGate(){
  const [show, setShow] = useState(true)
  if(typeof window !== 'undefined' && localStorage.getItem('sss_done')) return null
  if(!show) return null

  async function enable(){
    const pos = await new Promise((res, rej)=> navigator.geolocation.getCurrentPosition(res, rej))
    const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
    stream.getTracks().forEach(t=>t.stop())
    localStorage.setItem('sss_done','1')
    window.location.reload()
  }

  return(
    <div style={{position:'fixed', inset:0, zIndex:9999, background:'black', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#111', padding:24, borderRadius:16, width:340}}>
        <h2 style={{color:'white', fontWeight:900}}>Your Block Needs 3 Permissions</h2>
        <p style={{color:'#aaa', fontSize:12, marginTop:8}}>Location, Camera, Microphone - required for 95122 to work on any device.</p>
        <button onClick={enable} style={{marginTop:16, width:'100%', background:'white', color:'black', fontWeight:900, padding:14, borderRadius:10}}>ENABLE ALL 3 - CONTINUE TO 95122</button>
      </div>
    </div>
  )
}
