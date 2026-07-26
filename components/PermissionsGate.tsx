'use client'
import { useState, useEffect } from 'react'

export default function PermissionsGate(){
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(()=>{
    // FIX: Don't read localStorage during render - wait for client
    // Also, if browser already blocked us, clear the old flag so we ask again
    const alreadyEnabled = localStorage.getItem('sss_v4') === '1'
    const permBlocked = document.cookie.includes('camera=()') // safety
    if(!alreadyEnabled){
      setShow(true)
    }
  },[])

  if(!show) return null

  async function enableAll(){
    try{
      setStatus('Asking for camera + mic...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      })
      stream.getTracks().forEach(t=>t.stop())
      setStatus('Got it! Checking location...')

      try{
        await new Promise((res, rej)=> navigator.geolocation.getCurrentPosition(res, rej, {timeout: 5000}))
      }catch{}

      localStorage.setItem('sss_v4','1')
      setShow(false)
      window.location.reload()

    }catch(err:any){
      console.error('PermissionsGate error', err)
      if(err.name === 'NotAllowedError'){
        // FIX: Clear the flag so we can ask again next reload
        localStorage.removeItem('sss_v4')
        alert('You clicked Block or Dismiss.\n\nTo fix:\n1. Click the 🔒 lock icon left of URL -> Reset permissions\n2. Reload\n3. Click ENABLE again -> Click Allow on the TOP popup (not this box)')
      } else if(err.name === 'NotFoundError'){
        alert('No camera found. Trying mic only so you can still use the block.')
        try{
          const micOnly = await navigator.mediaDevices.getUserMedia({audio:true})
          micOnly.getTracks().forEach(t=>t.stop())
          localStorage.setItem('sss_v4','1')
          setShow(false)
          window.location.reload()
        }catch{}
      } else if(err.name === 'NotReadableError'){
        alert('Camera is in use by another app (Zoom, Teams, FaceTime). Close those apps/tabs and click ENABLE again.')
      } else {
        alert('Could not start: ' + err.message)
      }
      setStatus('')
    }
  }

  return(
    <div style={{position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#111', border:'1px solid #333', borderRadius:16, padding:24, width:360, textAlign:'center'}}>
        <h2 style={{color:'white', fontWeight:900}}>Enable Your Block</h2>
        <p style={{color:'#aaa', fontSize:12, marginTop:8}}>Tap below - your browser will ask to Allow Camera + Microphone together.</p>
        {status && <p style={{color:'#0f0', fontSize:12, marginTop:8}}>{status}</p>}
        <button onClick={enableAll} style={{marginTop:16, width:'100%', background:'white', color:'black', fontWeight:900, padding:16, borderRadius:12}}>ENABLE - START 95122</button>
      </div>
    </div>
  )
}
