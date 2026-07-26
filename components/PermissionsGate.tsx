'use client'
import { useState, useEffect } from 'react'

export default function PermissionsGate(){
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('Ready to enable')

  useEffect(()=>{
    if(!localStorage.getItem('sss_gate_v3')) setShow(true)
  },[])

  async function enableAll(){
    // 1. FORCE location popup - must be direct, no timeout wrapper
    setMsg('Look at top of browser - Allow Location popup should appear...')
    try{
      await new Promise((resolve, reject)=>{
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      setMsg('Location OK - now camera...')
    }catch(e:any){
      setMsg('If you dont see a popup: Click 🔒 lock icon next to sweetsocialspace.com/feed -> Location -> Allow -> Reload page')
      // DON'T return - keep going to camera so you get that popup too
    }

    // 2. FORCE camera + mic popup - this opens the computer's real camera folder
    try{
      setMsg('Now look for camera popup - sweetsocialspace.com wants to use your camera [Allow]...')
      const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
      stream.getTracks().forEach(t=>t.stop())
      localStorage.setItem('sss_gate_v3','1')
      setShow(false)
      setMsg('All 3 allowed - reloading...')
      setTimeout(()=>window.location.reload(), 500)
    }catch(err:any){
      setMsg('Camera popup blocked. After reset you MUST see a popup at top. If not, click 🔒 > Camera > Allow, Mic > Allow, Location > Allow, then Reload.')
    }
  }

  if(!show) return null

  return(
    <div style={{position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div style={{background:'#151515', border:'1px solid #333', borderRadius:20, padding:22, maxWidth:380, width:'100%'}}>
        <h2 style={{color:'white', fontWeight:900, fontSize:18}}>Your Block Needs 3 Permissions</h2>
        <p style={{color:'#999', fontSize:12, marginTop:6}}>On laptop, iPhone, Android - browser will ask you to Allow each one.</p>
        <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:8}}>
          <div style={{background:'#222', padding:'10px 12px', borderRadius:10, color:'white', fontSize:13}}>📍 Location - to put you in 95122</div>
          <div style={{background:'#222', padding:'10px 12px', borderRadius:10, color:'white', fontSize:13}}>🎥 Camera - for GO LIVE video</div>
          <div style={{background:'#222', padding:'10px 12px', borderRadius:10, color:'white', fontSize:13}}>🎤 Microphone - for voice</div>
        </div>
        <div style={{marginTop:12, color:'#ff0', fontSize:12, fontWeight:700, minHeight:20}}>{msg}</div>
        <button onClick={enableAll} style={{marginTop:14, width:'100%', background:'white', color:'black', fontWeight:900, padding:'14px', borderRadius:12}}>ENABLE ALL 3 - CONTINUE</button>
        <button onClick={()=>{localStorage.setItem('sss_gate_v3','1'); setShow(false)}} style={{marginTop:8, width:'100%', background:'transparent', color:'#666', padding:'8px', fontSize:11}}>Skip - I already allowed</button>
      </div>
    </div>
  )
}
