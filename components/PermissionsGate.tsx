'use client'
import { useState } from 'react'

export default function PermissionsGate(){
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState('')

  if(typeof window!== 'undefined' && localStorage.getItem('sss_v4')) return null
  if(done) return null

  async function enableAll(){
    try{
      setStatus('Asking for camera + mic...')

      // FIX: Ask for BOTH at once in ONE popup - this is what makes it global
      // This makes Chrome show: "sweetsocialspace.com wants to use your camera and microphone [Allow]"
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      })

      // Success - we got both, now stop them so GO LIVE can use them
      stream.getTracks().forEach(t=>t.stop())
      setStatus('Camera + Mic allowed! Now asking location...')

      // 2. Location - ask after camera/mic
      try{
        await new Promise((res, rej)=> {
          navigator.geolocation.getCurrentPosition(res, rej)
        })
      }catch(e){
        console.log('Location denied, continuing anyway', e)
      }

      // Only save that we are done IF camera+mic worked
      localStorage.setItem('sss_v4','1')
      setDone(true)
      window.location.reload()

    }catch(err:any){
      console.error('PermissionsGate error', err)
      const name = err?.name || ''

      if(name === 'NotAllowedError'){
        alert('You clicked Block or Dismiss.\n\nTo fix: Click the 🔒 lock icon left of the URL -> Reset permissions -> Reload -> Click ENABLE again -> Click Allow on the popup.')
      } else if(name === 'NotFoundError'){
        alert('No camera found. If you are on a desktop without camera, click ENABLE again to allow mic + location, or use your phone.')
        // Still allow them to continue with mic only if no camera
        try{
          const micOnly = await navigator.mediaDevices.getUserMedia({audio:true})
          micOnly.getTracks().forEach(t=>t.stop())
          localStorage.setItem('sss_v4','1')
          setDone(true)
          window.location.reload()
        }catch{}
      } else {
        alert('Could not start camera/mic: ' + (err.message || name) + '. Close other tabs using camera (Zoom, Meet) and try again.')
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
