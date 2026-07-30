'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

export default function KarmaLeaderboard() {
  const { zip: contextZip } = useLocation()
  const zip = contextZip && contextZip!== 'GLOBAL'? contextZip : 'GLOBAL'
  const [leaders, setLeaders] = useState<any[]>([])

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') return
    let mounted = true
    const load = async () => {
      try {
        const supabase = createClient() as any
        const { data } = await supabase
         .from('profiles')
         .select('id, display_name, karma_points')
         .eq('zip_code', zip) // VARIABLE - GLOBAL, never hardcoded
         .order('karma_points', { ascending: false })
         .limit(5)
        if (mounted && data) setLeaders(data)
      } catch {}
    }
    load()
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-yellow-400 font-black text-xs mb-2">🏆 KARMA LEADERS • {zip === 'GLOBAL'? 'YOUR AREA' : zip}</div>
      {leaders.map((u, i) => (
        <div key={u.id} className="flex justify-between text-xs text-white py-1 border-b border-white/5 last:border-0">
          <span>{i+1}. {u.display_name || 'Neighbor'}</span>
          <span className="font-black text-yellow-400">{u.karma_points || 0}</span>
        </div>
      ))}
      {leaders.length===0 && <div className="text-xs text-white/40">Be first to earn karma in {zip === 'GLOBAL'? 'your area' : zip} - post, get hearts</div>}
    </div>
  )
}
