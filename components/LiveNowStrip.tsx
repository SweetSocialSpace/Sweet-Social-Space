'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveNowStrip(){
  const [live, setLive] = useState(false)
  const [stream, setStream] = useState<MediaStream|null>(null)
  const [status, setStatus] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const recorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])

  // attach camera to video AFTER box is rendered
  useEffect(()=>{
    if(live && stream && videoRef.current){
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(()=>{})
    }
  },[live, stream])

  // cleanup on unmount
  useEffect(()=>{
    return ()=>{
      stream?.getTracks().forEach(t=>t.stop())
    }
  },[stream])

  async function goLive(){
    setStatus('Asking for camera...')
    try{
      // Check if browser even supports it
      if(!navigator.mediaDevices ||!navigator.mediaDevices.getUserMedia){
        alert('This browser does not support live camera. Please use Chrome, Safari, or Edge on HTTPS.')
        return
      }

      // 1. THIS is what triggers the real browser popup globally
      // We ask for video + audio directly in the click handler
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      })

      setStream(s)
      setLive(true)
      setStatus('')

      const rec = new MediaRecorder(s)
      recorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = e=>{ if(e.data.size>0) chunksRef.current.push(e.data) }
      rec.onstop = async ()=>{
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const supabase = createClient()
        const {data:{user}} = await supabase.auth.getUser()
        if(user){
          const name = `live-${user.id}-${Date.now()}.webm`
          await supabase.storage.from('media').upload(name, blob, {upsert:true})
          const url = supabase.storage.from('media').getPublicUrl(name).data.publicUrl
          await supabase.from('posts').insert({body:'🔴 LIVE', content:'🔴 LIVE', media_urls:[url], post_type:'general', tag:'live', city:'San Jose', zip_code:'95122', user_id:user.id, author_id:user.id})
        }
        s.getTracks().forEach(t=>t.stop())
        window.location.reload()
      }
      rec.start()

      const supabase = createClient()
      const {data:{user}} = await supabase.auth.getUser()
      if(user) await supabase.from('live_streams').insert({user_id:user.id, is_active:true, zip:'95122'})

    }catch(err:any){
      console.error("GO LIVE ERROR:", err)
      const name = err?.name || ''

      if(name === 'NotAllowedError' || name === 'PermissionDeniedError'){
        // User REALLY blocked it
        alert('Camera permission was denied.\n\nClick the 🔒 lock icon left of the URL -> Camera -> Allow -> then reload page and click GO LIVE again.\n\nIf you have multiple tabs of Sweet Social Space open, close them first.')
      } else if(name === 'NotFoundError' || name === 'DevicesNotFoundError'){
        alert('No camera or microphone found. Please plug in a camera or use a phone/computer with a camera.')
      } else if(name === 'NotReadableError' || name === 'TrackStartError'){
        alert('Camera is in use by another app or another tab. Please close other tabs that use the camera (Zoom, Teams, etc.) and try again.')
      } else {
        alert('Could not start camera: ' + (err.message || name) + '\n\nTry reloading the page and clicking GO LIVE again.')
      }
      setStatus('')
    }
  }

  function endLive(){
    try{ recorderRef.current?.stop() }catch{}
    try{ stream?.getTracks().forEach(t=>t.stop()) }catch{}
    setLive(false)
    setStream(null)
    setStatus('')
  }

  if(!live){
    return <button onClick={goLive} style={{background:'white', color:'black', fontWeight:900, padding:'6px 18px', borderRadius:999, fontSize:12}}>GO LIVE</button>
  }

  return(
    <div style={{position:'fixed', bottom:20, right:20, zIndex:9999, background:'black', padding:8, borderRadius:16, border:'3px solid red', width:320}}>
      <video ref={videoRef} autoPlay muted playsInline style={{width:'100%', height:400, background:'black', borderRadius:12, objectFit:'cover'}} />
      <div style={{display:'flex', justifyContent:'space-between', marginTop:8, alignItems:'center'}}>
        <span style={{color:'red', fontSize:12, fontWeight:700}}>● LIVE - 95122 {status? `- ${status}` : ''}</span>
        <button onClick={endLive} style={{background:'white', color:'black', fontWeight:900, padding:'6px 14px', borderRadius:999, fontSize:12}}>END LIVE</button>
      </div>
    </div>
  )
}
export default LiveNowStrip
