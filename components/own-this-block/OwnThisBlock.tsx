'use client'
import { useLocation } from '@/lib/location-context'
import { useTranslations } from '@/lib/translations'

export function OwnThisBlock() {
  const { zip } = useLocation()
  const t = useTranslations() as any
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 border-2 border-black">
      <div className="text-black font-black text-sm">{t?.ownBlock?.title || 'OWN THIS BLOCK? 💰'}</div>
      <div className="text-black/80 text-xs mt-1">{t?.ownBlock?.pin || `Pin your business in ${zip} for $29/mo`}</div>
      <a href="/business/claim" className="mt-3 block bg-black text-white text-xs font-black px-4 py-2 rounded-full text-center">{t?.ownBlock?.claim || `CLAIM ${zip} →`}</a>
    </div>
  )
}
export default OwnThisBlock
