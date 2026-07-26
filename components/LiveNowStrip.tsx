'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

export function LiveNowStrip(){
  const { zip } = useLocation()
  const [isLive, setIsLive] = useState(false)

  const toggleLive = async ()=>{
    if(!isLive){
      // Try camera, but DON'T require it
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        ;(window as any)._liveStream = stream
      }catch{
        // If blocked or no camera, still go live — don't stop the user
        console.log('Camera not available, going live without it')
      }
      
      setIsLive(true)
      try{
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if(user?.id){
          await supabase.from('live_streams').insert({ user_id: user.id, is_active:true, status:'live', zip: zip || '95122' })
        }
      }catch(e){ console.error(e) }
      
    }else{
      try{
        const s = (window as any)._liveStream as MediaStream
        s?.getTracks().forEach(t=>t.stop())
      }catch{}
      setIsLive(false)
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 text-white text-xs">
        <span className={`h-2 w-2 rounded-full ${isLive?'bg-red-500 animate-pulse':'bg-white/40'}`}></span>
        <span className="font-bold">LIVE NOW:</span>
        <span className="text-white/70">{isLive?`You are live in ${zip}!`:'No one live — start one!'}</span>
      </div>
      <button onClick={toggleLive} className={`${isLive?'bg-red-600 text-white':'bg-white text-black'} font-black text-xs rounded-full px-4 py-1.5`}>
        {isLive?'END LIVE':'GO LIVE'}
      </button>
    </div>
  )
}
export default LiveNowStrip
