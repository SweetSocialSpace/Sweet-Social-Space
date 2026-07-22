'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

export function LiveNowStrip(){
  const { zip } = useLocation()
  const [isLive, setIsLive] = useState(false)

  const toggleLive = async ()=>{
    if(!isLive){
      try{
        const s = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
        ;(window as any)._liveStream = s
        setIsLive(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        // GLOBAL FIX: use real user zip, not hardcoded 95122
        const liveZip = zip || user?.user_metadata?.zip_code || ''
        if (!liveZip) {
          alert('Please set your zip code in profile first')
          return
        }
        await supabase.from('live_streams').insert({ user_id: user?.id, is_active:true, status:'live', zip: liveZip })
      }catch{ alert('Need camera/mic permission') }
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
      <button onClick={toggleLive} style={{color: isLive ? 'white':'black'}} className={`${isLive?'bg-red-600':'bg-white'} font-black text-xs rounded-full px-4 py-1.5`}>
        {isLive?'END LIVE':'GO LIVE'}
      </button>
    </div>
  )
}
export default LiveNowStrip
