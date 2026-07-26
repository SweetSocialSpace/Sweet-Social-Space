'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveNowStrip(){
  const [live, setLive] = useState(false)
  const [stream, setStream] = useState<MediaStream|null>(null)
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

  async function goLive(){
    try{
      // 1. ASK FOR CAMERA FIRST - this triggers the browser popup
      const s = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
      setStream(s)
      setLive(true)

      const rec = new MediaRecorder(s)
      recorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = e=>{ if(e.data.size>0) chunksRef.current.push(e.data) }
      rec.onstop = async ()=>{
        const blob = new Blob(chunksRef.current)
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
      // THIS IS WHAT YOU WANTED - pops up if blocked
      alert('Camera blocked. Click the 🔒 lock icon left of the URL -> Camera -> Allow -> Reload page, then GO LIVE again.')
      console.error(err)
    }
  }

  function endLive(){
    try{ recorderRef.current?.stop() }catch{}
    try{ stream?.getTracks().forEach(t=>t.stop()) }catch{}
    setLive(false)
    setStream(null)
  }

  if(!live){
    return <button onClick={goLive} style={{background:'white', color:'black', fontWeight:900, padding:'6px 18px', borderRadius:999, fontSize:12}}>GO LIVE</button>
  }

  return(
    <div style={{position:'fixed', bottom:20, right:20, zIndex:9999, background:'black', padding:8, borderRadius:16, border:'3px solid red', width:320}}>
      <video ref={videoRef} autoPlay muted playsInline style={{width:'100%', height:400, background:'black', borderRadius:12, objectFit:'cover'}} />
      <div style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
        <span style={{color:'red', fontSize:12, fontWeight:700}}>● LIVE - 95122</span>
        <button onClick={endLive} style={{background:'white', color:'black', fontWeight:900, padding:'6px 14px', borderRadius:999, fontSize:12}}>END LIVE</button>
      </div>
    </div>
  )
}
export default LiveNowStrip
