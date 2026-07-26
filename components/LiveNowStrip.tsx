'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveNowStrip(){
  const [live, setLive] = useState(false)
  const [stream, setStream] = useState<MediaStream|null>(null)
  const [status, setStatus] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const recorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(()=>{
    if(live && stream && videoRef.current){
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(()=>{})
    }
  },[live, stream])

  useEffect(()=>{
    return ()=>{ try{ stream?.getTracks().forEach(t=>t.stop()) }catch{} }
  },[stream])

  async function goLive(){
    setStatus('Starting...')
    const supabase = createClient()

    // GLOBAL: Get user's actual location, not 95122
    let zip = '95122'
    let city = 'San Jose'
    try{
      const pos = await new Promise<GeolocationPosition>((res, rej)=>
        navigator.geolocation.getCurrentPosition(res, rej, {timeout: 5000})
      )
      // You can reverse geocode pos.coords here later for true global zip
      zip = 'live'
      city = 'Live'
    }catch{}

    try{
      // GLOBAL FIX 1: Check secure context without shaming browser name
      if(typeof window!== 'undefined' &&!window.isSecureContext){
        setStatus('')
        alert('Go Live needs a secure connection. Please open https://sweetsocialspace.com')
        return
      }

      // GLOBAL FIX 2: Try best quality, but allow ANY camera - old phones, low-end devices
      let s: MediaStream
      try{
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        })
      } catch {
        // If 720p fails (old phone), try anything
        try{
          s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        } catch {
          // If video fails, go audio-only so they can still be LIVE
          s = await navigator.mediaDevices.getUserMedia({ audio: true })
        }
      }

      setStream(s)
      setLive(true)
      setStatus('● LIVE')

      // GLOBAL FIX 3: Pick recorder format that device actually supports
      // iPhone Safari = mp4, Android/Chrome = webm, Firefox = ogg
      let mimeType = 'video/webm'
      if(MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4'
      else if(MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) mimeType = 'video/webm;codecs=vp9'
      else if(MediaRecorder.isTypeSupported('video/webm')) mimeType = 'video/webm'

      try{
        const rec = new MediaRecorder(s, { mimeType } as any)
        recorderRef.current = rec
        chunksRef.current = []
        rec.ondataavailable = e=>{ if(e.data.size>0) chunksRef.current.push(e.data) }
        rec.onstop = async ()=>{
          if(chunksRef.current.length === 0) return
          const blob = new Blob(chunksRef.current, { type: mimeType })
          const {data:{user}} = await supabase.auth.getUser()
          if(user){
            const ext = mimeType.includes('mp4')? 'mp4' : 'webm'
            const name = `live-${user.id}-${Date.now()}.${ext}`
            await supabase.storage.from('media').upload(name, blob, {upsert:true})
            const url = supabase.storage.from('media').getPublicUrl(name).data.publicUrl
            await supabase.from('posts').insert({
              body:'🔴 LIVE', content:'🔴 LIVE',
              media_urls:[url], post_type:'general', tag:'live',
              city, zip_code: zip,
              user_id:user.id, author_id:user.id
            })
          }
          s.getTracks().forEach(t=>t.stop())
        }
        rec.start(1000)
      }catch{
        // If recorder fails, still show them LIVE without recording - don't crash
        console.log('Recorder not supported, live preview only')
      }

      try{
        const {data:{user}} = await supabase.auth.getUser()
        if(user) await supabase.from('live_streams').insert({user_id:user.id, is_active:true, zip_code: zip, zip: zip})
      }catch{}

    }catch(err:any){
      console.error("GO LIVE ERROR:", err)
      const name = err?.name || ''

      // GLOBAL MESSAGES - No browser names, no "plug in a camera"
      if(name === 'NotAllowedError'){
        alert('Live was blocked.\n\nTap the 🔒 lock icon near the address bar -> Allow Camera & Microphone -> Reload -> Tap GO LIVE again.\n\nClose other apps using camera like Zoom or WhatsApp Video.')
      } else if(name === 'NotFoundError'){
        // GLOBAL: Don't block them, let them post audio or text
        alert('We could not find your camera. You can still post to your block - try again and we will connect your microphone.')
      } else if(name === 'NotReadableError'){
        alert('Your camera is busy in another app or tab. Close other video apps and try GO LIVE again.')
      } else {
        // GLOBAL FALLBACK: Never tell them their browser is wrong
        setStatus('')
        alert('Could not start Live right now. You can still post a video to your block - tap Post instead.')
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
        <span style={{color:'red', fontSize:12, fontWeight:700}}>{status || '● LIVE'}</span>
        <button onClick={endLive} style={{background:'white', color:'black', fontWeight:900, padding:'6px 14px', borderRadius:999, fontSize:12}}>END LIVE</button>
      </div>
    </div>
  )
}
export default LiveNowStrip
