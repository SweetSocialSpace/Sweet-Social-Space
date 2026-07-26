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
        // Use back camera by default like GoLiveButton
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: true
        })
        ;(window as any)._liveStream = s
        setIsLive(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const liveZip = zip || user?.user_metadata?.zip_code || '95122'
        if (!liveZip) {
          alert('Please set your zip code in profile first')
          return
        }
        await supabase.from('live_streams').insert({ 
          user_id: user?.id, 
          is_active: true, 
          status: 'live', 
          zip: liveZip 
        })
      }catch(err: any){
        // Show REAL error, not fake permission error
        alert(`Camera failed: ${err?.message || err}. Check Settings -> Safari -> Camera = Allow`)
        console.error(err)
      }
    }else{
      const s = (window as any)._liveStream as MediaStream
      s?.getTracks().forEach(t=>t.stop())
      setIsLive(false)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if(user?.id){
        await supabase.from('live_streams').update({ is_active: false }).eq('user_id', user.id)
      }
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
