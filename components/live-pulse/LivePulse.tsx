'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LivePulse() {
  const supabase = createClient()
  const [temp, setTemp] = useState<number | null>(null)
  const [online, setOnline] = useState(0)

  useEffect(() => {
    const fetchTemp = () => {
      const saved = localStorage.getItem('sss_live_temp_95122')
      if (saved) setTemp(parseInt(saved))
    }
    fetchTemp()
    const t = setInterval(fetchTemp, 5000)

    const fetchOnline = async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen', new Date(Date.now() - 5*60*1000).toISOString())
      if (count!== null) setOnline(count)
    }
    fetchOnline()
    const o = setInterval(fetchOnline, 30000)

    return () => { clearInterval(t); clearInterval(o) }
  }, [])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-white text-black font-black px-3 py-1 rounded-full text-xs">LIVE 95122</span>
        {temp? <span className="bg-white/20 text-white font-black px-3 py-1 rounded-full text-xs">{temp}° 95122 Live</span> : null}
        <span className="bg-white/10 text-white font-bold px-3 py-1 rounded-full text-xs">{online} online</span>
      </div>
      <div className="flex items-center gap-2 text-white/80 text-xs">
        <span className="w-3 h-3 rounded-full bg-blue-400"></span>
        <span className="font-black">100% Verified • 95122</span>
        <span className="ml-auto font-bold">3/3</span>
      </div>
    </div>
  )
}
