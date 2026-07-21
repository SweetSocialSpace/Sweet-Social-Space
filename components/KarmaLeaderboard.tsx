'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

export default function KarmaLeaderboard() {
  const { zip } = useLocation()
  const [leaders, setLeaders] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('id, display_name, karma_points').order('karma_points', {ascending:false}).limit(5)
      if (data) setLeaders(data)
    })()
  }, [zip])

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-yellow-400 font-black text-xs mb-2">🏆 KARMA LEADERS • {zip}</div>
      {leaders.map((u, i) => (
        <div key={u.id} className="flex justify-between text-xs text-white py-1 border-b border-white/5 last:border-0">
          <span>{i+1}. {u.display_name || 'Neighbor'}</span>
          <span className="font-black text-yellow-400">{u.karma_points || 0}</span>
        </div>
      ))}
      {leaders.length===0 && <div className="text- text-white/40">Be first to earn karma in {zip} - post, get hearts</div>}
    </div>
  )
}
