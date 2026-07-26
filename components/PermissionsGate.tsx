'use client'
import { useState, useEffect } from 'react'

export default function PermissionsGate(){
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState({ loc:'checking', cam:'checking', mic:'checking' })

  useEffect(()=>{
    const seen = localStorage.getItem('sss_perm_seen')
    if(!seen) setShow(true)
    checkAll()
  },[])

  async function checkAll(){
    // LOCATION
    try{
      await new Promise((res, rej)=>{
        navigator.geolocation.getCurrentPosition(()=>{ setStatus(s=>({...s, loc:'ok'})); res(true) }, ()=>{ setStatus(s=>({...s, loc:'need'})); rej() }, {timeout:3000})
      })
    }catch{ setStatus(s=>({...s, loc:'need'})) }

    // CAMERA + MIC
    try{
      const s = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
      setStatus({loc:'ok', cam:'ok', mic:'ok'})
      s.getTracks().forEach(t=>t.stop())
      setShow(false)
      localStorage.setItem('sss_perm_seen','1')
    }catch{
      setStatus(s=>({...s, cam:'need', mic:'need'}))
      setShow(true)
    }
  }

  async function enableAll(){
    try{
      // This one click triggers all 3 browser popups automatically
      const pos = await new Promise((res, rej)=>{
        navigator.geolocation.getCurrentPosition(res, rej)
      })
      const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
      stream.getTracks().forEach(t=>t.stop())
      setShow(false)
      localStorage.setItem('sss_perm_seen','1')
      window.location.reload()
    }catch{
      alert('PLATFORM REQUIREMENTS:\n\n1. LOCATION - Click Allow when it says "sweetsocialspace.com wants to know your location"\n2. CAMERA - Click Allow when it says "wants to use your camera"\n3. MICROPHONE - Click Allow when it says "wants to use your microphone"\n\nIf you clicked Block before: Click 🔒 lock icon -> Reset permissions -> Reload -> Then click ENABLE again.')
    }
  }

  if(!show) return null

  return(
    <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:10000, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{background:'#111', border:'2px solid #333', borderRadius:20, padding:24, maxWidth:400, width:'100%'}}>
        <h2 style={{color:'white', fontWeight:900, fontSize:20, marginBottom:8}}>Welcome to Your Block - 95122</h2>
        <p style={{color:'#aaa', fontSize:13, marginBottom:16}}>For Sweet Social Space to function, your device MUST allow 3 things. This works the same on laptop, iPhone, Android, tablet.</p>
        
        <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:20}}>
          <div style={{display:'flex', justifyContent:'space-between', background:'#222', padding:'10px 14px', borderRadius:10}}>
            <span style={{color:'white', fontSize:13}}>📍 Location (to find your block)</span>
            <span style={{color: status.loc==='ok'?'#0f0':'red', fontSize:12, fontWeight:700}}>{status.loc==='ok'?'✓':'REQUIRED'}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', background:'#222', padding:'10px 14px', borderRadius:10}}>
            <span style={{color:'white', fontSize:13}}>🎥 Camera (for GO LIVE)</span>
            <span style={{color: status.cam==='ok'?'#0f0':'red', fontSize:12, fontWeight:700}}>{status.cam==='ok'?'✓':'REQUIRED'}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', background:'#222', padding:'10px 14px', borderRadius:10}}>
            <span style={{color:'white', fontSize:13}}>🎤 Microphone (for voice posts)</span>
            <span style={{color: status.mic==='ok'?'#0f0':'red', fontSize:12, fontWeight:700}}>{status.mic==='ok'?'✓':'REQUIRED'}</span>
          </div>
        </div>

        <button onClick={enableAll} style={{width:'100%', background:'white', color:'black', fontWeight:900, padding:'14px', borderRadius:12, fontSize:15}}>ENABLE ALL 3 - CONTINUE TO 95122</button>
        <p style={{color:'#666', fontSize:11, marginTop:12, textAlign:'center'}}>One tap will trigger all 3 permission popups automatically. If you previously blocked, click the 🔒 lock icon -> Allow -> Reload.</p>
      </div>
    </div>
  )
}
