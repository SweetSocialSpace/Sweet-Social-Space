'use client'
export default function LivePulse() {
  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-white text-black font-black px-3 py-1 rounded-full text-xs">LIVE 95122</span>
        <span className="bg-white/20 text-white font-black px-3 py-1 rounded-full text-xs">96° 95122 Live</span>
        <span className="bg-white/10 text-white font-bold px-3 py-1 rounded-full text-xs">0 online</span>
      </div>
      <div className="flex items-center gap-2 text-white/80 text-xs">
        <span className="w-3 h-3 rounded-full bg-blue-400"></span>
        <span className="font-black">100% Verified • 95122</span>
        <span className="ml-auto font-bold">3/3</span>
      </div>
    </div>
  )
}
