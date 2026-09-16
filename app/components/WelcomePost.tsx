'use client'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useTranslations, tFormat } from '@/lib/translations'

export default function WelcomePost() {
  const { zip, city } = useLocation()
  const { language } = useLanguage()
  const t = useTranslations() as any
  const area = city || zip || 'your block'

  // Auto-translate dictionary — used ONLY if JSON key missing, respects user's language
  const auto = (en: string, es: string) => {
    if (t?.welcome) return null // JSON exists, use it
    return language?.startsWith('es')? es : en
  }

  const L = {
    pinned: t?.welcome?.pinned || auto(`AI Mayor • Pinned for neighbors in ${area}`, `AI Mayor • Fijado para vecinos en ${area}`) || (language?.startsWith('es')? `AI Mayor • Fijado para vecinos en ${area}` : `AI Mayor • Pinned for neighbors in ${area}`),
    privateBlock: t?.welcome?.privateBlock || (language?.startsWith('es')? `Tu bloque privado • ${area}` : `Your private block • ${area}`),
    foundUs: t?.welcome?.foundUs || (language?.startsWith('es')? `Nos encontraste. Bienvenido a tu bloque privado.` : `You found us. Welcome to your private block.`),
    yourSpace: t?.welcome?.yourSpace || (language?.startsWith('es')? `Este es tu espacio cerca de ${area} — no todo el internet.` : `This is your space near ${area} — not the whole internet.`),
    threeWays: t?.welcome?.threeWays || (language?.startsWith('es')? `3 formas de empezar:` : `3 ways to start:`),
    step1: t?.welcome?.step1 || (language?.startsWith('es')? `Saluda y comparte tus cruces de calles (no necesitas dirección exacta)` : `Say hi and share your cross streets (no exact address needed)`),
    step2: t?.welcome?.step2 || (language?.startsWith('es')? `Publica una cosa que necesitas o una cosa que puedes dar` : `Post one thing you need or one thing you can give`),
    step3: t?.welcome?.step3 || (language?.startsWith('es')? `Toca Usar mi ubicación para desbloquear tu Mapa de Bloque` : `Tap Use my location to unlock your Block Map`),
    noRobots: t?.welcome?.noRobots || (language?.startsWith('es')? `Sin robots. Sin shadowbans. Fe bienvenida. Respeto requerido.` : `No robots. No shadowbans. Faith welcome. Respect required.`),
    speakFreely: t?.welcome?.speakFreely || (language?.startsWith('es')? `Habla Libremente. Ama a Tu Vecino.` : `Speak Freely. Love Your Neighbor.`),
  }

  // Use tFormat if JSON has {area} placeholder, otherwise use our built L
  const formatArea = (key: string, fallback: string) => {
    if (t?.welcome?.[key]) return tFormat(t.welcome[key], { area })
    return fallback
  }

  return (
    <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 border border-white/15 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center font-black text-black shadow">AI</div>
          <div>
            <p className="font-black text-white/90 text-xs tracking-wide">{formatArea('pinned', L.pinned)}</p>
            <p className="text-xs font-bold text-white/50">{formatArea('privateBlock', L.privateBlock)}</p>
          </div>
        </div>
        <h3 className="text-base font-black text-white leading-snug mb-2">🎉 {formatArea('foundUs', L.foundUs)}</h3>
        <p className="text-sm text-white/80 mb-4">{formatArea('yourSpace', L.yourSpace)}</p>
        <p className="font-black text-white text-sm mb-2">{L.threeWays}</p>
        <ol className="list-decimal list-inside space-y-1 text-white/80 text-sm font-semibold mb-4">
          <li>{L.step1}</li>
          <li>{L.step2}</li>
          <li>{L.step3}</li>
        </ol>
        <p className="text-xs font-bold text-white/40">{L.noRobots}</p>
        <p className="mt-3 font-black text-amber-300 tracking-widest text-xs">{L.speakFreely}</p>
      </div>
    </div>
  )
}
