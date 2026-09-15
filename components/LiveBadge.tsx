'use client'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'

export default function LiveBadge(){
  const t = useTranslations() as any
  const { zip } = useLocation()
  const label = zip && zip !== 'LOCAL' ? zip : (t?.live?.yourArea || 'YOUR AREA')
  return <div className="text-white/60 text-xs font-black">{label} • {t?.live?.live || 'LIVE'}</div>
}
