'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveNowStrip(){
  const [count, setCount] = useState(0)
  const [isLive, setIsLive] = useState(false)

  useEffect(()=>{
    const supabase = createClient()
    supabase.from('live_streams').select('id',{count:'exact',head:true}).eq('is_active', true).then(({count})=>{
      if(count) setCount(count)
    })
  },[])

  const toggleLive = async ()=>{
    if(!isLive){
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        ;(window as any)._liveStream = stream
        setIsLive(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('live_streams').insert({ user_id: user?.id, status: 'live', is_active: true, zip: '95122' })
      }catch{ alert('Need camera/mic permission to go live') }
    }else{
      const s = (window as any)._liveStream as MediaStream
      s?.getTracks().forEach(t=>t.stop())
      setIsLive(false)
      const supabase = createClient()
      await supabase.from('live_streams').update({ status: 'ended', is_active: false }).eq('status','live')
    }
  }

  return (
    <div className="flex items-center justify-between text-white text-xs bg-white/5 rounded-full px-3 py-2 border border-white/10">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isLive || count>0 ? 'bg-red-500 animate-pulse' : 'bg-white/30'}`}></span>
        <span className="font-bold">LIVE NOW:</span>
        <span className="text-white/70">{isLive ? 'You are live!' : count>0? `${count} live nearby` : `No one live — start one!`}</span>
      </div>
      <button onClick={toggleLive} className={`ml-3 px-3 py-1 rounded-full font-black text-xs ${isLive?'bg-red-600 text-white':'bg-white text-black hover:bg-white/90'}`}>
        {isLive? 'END' : 'GO LIVE'}
      </button>
    </div>
  )
}

export default LiveNowStrip

