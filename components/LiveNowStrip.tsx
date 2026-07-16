'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveNowStrip(){
  const [count, setCount] = useState(0)

  useEffect(()=>{
    const supabase = createClient()
    supabase.from('live_streams').select('id',{count:'exact'}).eq('status','live').then(({count})=>{
      if(count) setCount(count)
    })
  },[])

  return (
    <div className="flex items-center gap-2 text-white text-xs bg-white/5 rounded-full px-3 py-2">
      <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
      <span className="font-bold">LIVE NOW:</span>
      <span className="text-white/70">{count>0? `${count} people talking nearby` : `No one live — start one!`}</span>
    </div>
  )
}

export default LiveNowStrip
