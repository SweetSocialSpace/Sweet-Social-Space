'use client'
import Link from 'next/link'
import { useTranslations } from '@/lib/translations'

export default function LiveMap(){
  const t = useTranslations() as any
  return (
    <Link href="/live-map" className="block bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs">{t?.liveMap?.title}</div>
      <div className="text-white/40 text-xs mt-1">{t?.liveMap?.subtitle}</div>
    </Link>
  )
}
