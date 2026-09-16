'use client'
import { useLocation } from '@/lib/location-context'
import { useTranslations, tFormat } from '@/lib/translations'

export default function WelcomePost() {
  const { zip, city } = useLocation()
  const t = useTranslations() as any
  
  const area = city || zip || 'your block'

  return (
    <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 border border-white/15 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center font-black text-black shadow">AI</div>
          <div>
            <p className="font-black text-white/90 text-xs tracking-wide">
              {t?.welcome?.pinned ? tFormat(t.welcome.pinned, { area }) : t?.welcome?.pinned}
            </p>
            <p className="text-xs font-bold text-white/50">
              {t?.welcome?.privateBlock ? tFormat(t.welcome.privateBlock, { area }) : area}
            </p>
          </div>
        </div>
        <h3 className="text-base font-black text-white leading-snug mb-2">
          🎉 {t?.welcome?.foundUs}
        </h3>
        <p className="text-sm text-white/80 mb-4">
          {t?.welcome?.yourSpace ? tFormat(t.welcome.yourSpace, { area }) : t?.welcome?.yourSpace}
        </p>
        <p className="font-black text-white text-sm mb-2">{t?.welcome?.threeWays}</p>
        <ol className="list-decimal list-inside space-y-1 text-white/80 text-sm font-semibold mb-4">
          <li>{t?.welcome?.step1}</li>
          <li>{t?.welcome?.step2}</li>
          <li>{t?.welcome?.step3}</li>
        </ol>
        <p className="text-xs font-bold text-white/40">{t?.welcome?.noRobots}</p>
        <p className="mt-3 font-black text-amber-300 tracking-widest text-xs">{t?.welcome?.speakFreely}</p>
      </div>
    </div>
  )
}
