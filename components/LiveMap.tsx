'use client'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'

export default function LiveMap() {
  const { city, zip } = useLocation()
  const t = useTranslations() as any
  return (
    <Link href="/block-map" className="block bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3 hover:bg-black/60 transition-colors">
      <div className="text-white font-black text-xs mb-2">{t?.liveMap?.title || 'Live Map'} • {city || zip || (t?.common?.yourArea || 'your area')}</div>
      <div className="text-white/40 text-xs">{t?.liveMap?.pins || '3 live pins • Full view'}</div>
      <div className="mt-2 bg-white text-black rounded-full px-3 py-1 text-xs font-bold inline-block">{t?.liveMap?.viewMap || 'View Map'}</div>
    </Link>
  )
}
