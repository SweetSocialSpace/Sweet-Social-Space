'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useTranslations } from '@/lib/translations'

export default function KarmaLeaderboard() {
  const t = useTranslations() as any
  const { zip: contextZip } = useLocation()
  const { filter } = useLocationScope()
  const zip = contextZip && contextZip!== 'GLOBAL'? contextZip : 'GLOBAL'
  const [leaders, setLeaders] = useState<any[]>([])

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') return
    let mounted = true
    const load = async () => {
      try {
        const supabase = createClient() as any
        let data: any[] = []
        
        if (filter.lat != null && filter.lng != null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, latitude, longitude')
            .gte('latitude', bbox.minLat)
            .lte('latitude', bbox.maxLat)
            .gte('longitude', bbox.minLng)
            .lte('longitude', bbox.maxLng)
            .limit(20)
          
          if (profileData) {
            data = applyScope(profileData, filter)
          }
        } else {
          const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('zip_code', zip)
          .limit(5)
          
          if (error) {
            console.log('Karma leaderboard error:', error.message)
            return
          }
          data = profileData || []
        }
        
        if (mounted && data) setLeaders(data)
      } catch (e) {
        console.log('Karma error', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [zip, filter])

  if (zip === 'GLOBAL') return null

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-yellow-400 font-black text-xs mb-2">🏆 {t?.karma?.leaders || 'KARMA LEADERS'} • {zip}</div>
      {leaders.map((u, i) => (
        <div key={u.id} className="flex justify-between text-xs text-white py-1 border-b border-white/5 last:border-0">
          <span>{i+1}. {u.display_name || t?.common?.neighbor || 'Neighbor'}</span>
          <span className="font-black text-yellow-400">★</span>
        </div>
      ))}
      {leaders.length===0 && <div className="text-xs text-white/40">{t?.karma?.beFirstIn || 'Be first in'} {zip} - {t?.karma?.beFirstDesc || 'post, get hearts'}</div>}
    </div>
  )
}
