'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

export function LiveNowStrip(){
  const { zip } = useLocation()
  const [isLive, setIsLive] = useState(false)

  const toggleLive = async ()=>{
    if(!isLive){
      try{
        // GLOBAL: works on any device, any camera, any browser
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        ;(window as any)._liveStream = stream
        setIsLive(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const liveZip = zip || (user?.user_metadata as any)?.zip_code || '95122'

        if(user?.id){
          await supabase.from('live_streams').insert({
            user_id: user.id,
            is_active: true,
            status: 'live',
            zip: liveZip
          })
        }
      }catch(err: any){
        let msg = 'Camera blocked'
        if(err?.name === 'NotAllowedError') msg = 'You blocked camera. Click the camera/lock icon in your address bar, set Camera to Allow, then reload the page.'
        if(err?.name === 'NotFoundError') msg = 'No camera found on this device.'
        if(err?.name === 'NotReadableError') msg = 'Camera is already in use by another app. Close Zoom/Teams/FaceTime and try again.'
        alert(`LIVE failed: ${msg}`)
        console.error(err)
      }
    }else{
      const s = (window as any)._liveStream as MediaStream
      s?.getTracks().forEach(t=>t.stop())
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
