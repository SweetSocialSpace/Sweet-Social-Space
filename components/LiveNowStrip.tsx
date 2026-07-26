'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveNowStrip(){
  const [live, setLive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream|null>(null)
  const recorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function goLive(){
    setLive(true)
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
      streamRef.current = stream
      if(videoRef.current){ videoRef.current.srcObject = stream }
      const rec = new MediaRecorder(stream)
      recorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = e=>{ if(e.data.size>0) chunksRef.current.push(e.data) }
      rec.onstop = async ()=>{
        const blob = new Blob(chunksRef.current)
        const supabase = createClient()
        const {data:{user}} = await supabase.auth.getUser()
        if(!user) return
        const name = `live-${user.id}-${Date.now()}.webm`
        await supabase.storage.from('media').upload(name, blob, {upsert:true})
        const url = supabase.storage.from('media').getPublicUrl(name).data.publicUrl
        await supabase.from('posts').insert({body:'🔴 LIVE', content:'🔴 LIVE', media_urls:[url], post_type:'general', tag:'live', city:'San Jose', zip_code:'95122', user_id:user.id, author_id:user.id})
        streamRef.current?.getTracks().forEach(t=>t.stop())
        window.location.reload()
      }
      rec.start()
    }catch{}
    try{
      const supabase = createClient()
      const {data:{user}} = await supabase.auth.getUser()
      if(user) await supabase.from('live_streams').insert({user_id:user.id, is_active:true, zip:'95122'})
    }catch{}
  }

  function endLive(){
    try{ recorderRef.current?.stop() }catch{}
    try{ streamRef.current?.getTracks().forEach(t=>t.stop()) }catch{}
    setLive(false)
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
