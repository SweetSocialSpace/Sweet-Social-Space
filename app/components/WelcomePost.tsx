'use client'
import { useLocation } from '@/lib/location-context'

export default function WelcomePost() {
  const { zip, city } = useLocation()
  const displayBlock = (zip && zip.toUpperCase()!=='YOUR BLOCK' && zip!==''? `${city? city+' • ':''}${zip}` : 'GLOBAL • Auto-detecting your block...')

  return (
    <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 border border-white/15 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center font-black text-black shadow">AI</div>
          <div>
            <p className="font-black text-white/90 text-xs tracking-wide">AI MAYOR • LIVE • {zip} • GLOBAL • Pinned for new neighbors</p>
            <p className="text-xs font-bold text-white/50">Posting as • {displayBlock} • Welcome • VERTEBRAE • Independent</p>
          </div>
        </div>
        <h3 className="text-base font-black text-white leading-snug mb-2">🎉 You found us. Welcome to your private block in {displayBlock}.</h3>
        <p className="text-sm text-white/80 mb-4">This is YOUR space within 10 miles of {city || zip} — not the whole internet — GLOBAL independent vertebrae.</p>
        <p className="font-black text-white text-sm mb-2">3 ways to start:</p>
        <ol className="list-decimal list-inside space-y-1 text-white/80 text-sm font-semibold mb-4">
          <li>Say hi and tell us your cross streets in {city || zip} (no exact address needed)</li>
          <li>Post one thing you need or one thing you can give in {zip}</li>
          <li>Tap &quot;Use my location&quot; to unlock your Block Map in {city || 'your area'}</li>
        </ol>
        <p className="text-xs font-bold text-white/50">No robots. No shadowbans. Faith welcome. Respect required. • {zip} • GLOBAL • Always-Automated • Failsafe</p>
        <p className="mt-3 font-black text-amber-300 tracking-widest text-xs">Speak Freely. Love Your Neighbor. • {displayBlock} • VERTEBRAE</p>
      </div>
    </div>
  )
}
