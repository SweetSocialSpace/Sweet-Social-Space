'use client'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'
export default function LiveBadge(){
  const { zip } = useLocation()
  const t = useTranslations()
  const label = zip && zip !== 'GLOBAL' ? zip : 'YOUR AREA'
  return <div className="text-white/60 text-xs font-black">{label} • {t.weather.live}</div>
}
