'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PinnedAlert() {
  const [msg, setMsg] = useState('No emergencies in 95122')
  useEffect(()=>{
    const supabase = createClient()
    supabase.from('pinned_alerts').select('*').order('created_at',{ascending:false}).limit(1).then(({data})=>{
      if(data?.[0]?.message) setMsg(data[0].message)
    })
  },[])
  return <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">📌 PINNED ALERT</p><p className="text-sm mt-2 text-white/80">{msg}</p></div>
}
