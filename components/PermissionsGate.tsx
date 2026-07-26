'use client'
import { useState, useEffect } from 'react'

export default function PermissionsGate(){
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    const seen = localStorage.getItem('sss_gate_v2')
    if(!seen) setShow(true)
  },[])

  async function enableAll(){
    setMsg('Requesting location...')
    try{
      await new Promise((res, rej)=>{
        navigator.geolocation.getCurrentPosition(res, rej, {timeout:8000})
      })
    }catch{
      setMsg('Location blocked. Click lock icon - Location - Allow')
      return
    }

    setMsg('Requesting camera + mic - look for Allow popup...')
    try{
      // THIS is what opens the computer's camera/mic folder automatically
      const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
      stream.getTracks().forEach(t=>t.stop())
      localStorage.setItem('sss_gate_v2','1')
      setShow(false)
      window.location.reload()
    }catch(e:any){
      if(e.name === 'NotAllowedError'){
        setMsg('You clicked Block. To fix: Click the 🔒 icon left of the URL > Camera/Mic/Location > Allow > Reload > Click ENABLE again.')
      } else {
        setMsg('No camera found. On mobile, make sure you are on https and not in private mode.')
      }
    }
  }

  if(!show) return null

  return(
    <div style={{position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div style={{background:'#151515', border:'1px solid #333', borderRadius:20, padding:22, maxWidth:380, width:'100%'}}>
        <h2 style={{color:'white', fontWeight:900, fontSize:18}}>Your Block Needs 3 Permissions</h2>
        <p style={{color:'#999', fontSize:12, marginTop:6}}>Same on laptop, iPhone, Android. Without these, LIVE and posting won't work.</p>
        <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:8}}>
          <div style={{background:'#222', padding:'10px 12px', borderRadius:10, color:'white', fontSize:13}}>📍 Location - to put you in 95122</div>
          <div style={{background:'#222', padding:'10px 12px', borderRadius:10, color:'white', fontSize:13}}>🎥 Camera - for GO LIVE video</div>
          <div style={{background:'#222', padding:'10px 12px', borderRadius:10, color:'white', fontSize:13}}>🎤 Microphone - for voice</div>
        </div>
        {msg && <div style={{marginTop:12, color:'#ff6', fontSize:12, fontWeight:700}}>{msg}</div>}
        <button onClick={enableAll} style={{marginTop:14, width:'100%', background:'white', color:'black', fontWeight:900, padding:'14px', borderRadius:12}}>ENABLE ALL 3 - CONTINUE</button>
        <p style={{color:'#666', fontSize:10, marginTop:10, textAlign:'center'}}>This button automatically opens your browser's permission prompts. If you previously blocked, Chrome requires you to click the 🔒 lock icon and Allow manually - no site can bypass that.</p>
      </div>
    </div>
  )
}
