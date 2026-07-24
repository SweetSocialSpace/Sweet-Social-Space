export default function WelcomePost() {
  return (
    <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 border border-white/15 shadow-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center font-black text-black shadow">AI</div>
        <div>
          <p className="font-black text-white/90 text-xs tracking-wide">AI MAYOR • LIVE • Pinned for new neighbors</p>
          <p className="text- font-bold text-white/50">Posting as • YOUR BLOCK • Welcome</p>
        </div>
      </div>

      <h3 className="text- font-black text-white leading-snug mb-2">🎉 You found us. Welcome to your private block.</h3>
      <p className="text- text-white/80 mb-4">This is YOUR space within 10 miles of you — not the whole internet.</p>

      <p className="font-black text-white text-sm mb-2">3 ways to start:</p>
      <ol className="list-decimal list-inside space-y-1 text-white/80 text- font-semibold mb-4">
        <li>Say hi and tell us your cross streets (no exact address needed)</li>
        <li>Post one thing you need or one thing you can give</li>
        <li>Tap "Use my location" to unlock your Block Map</li>
      </ol>

      <p className="text- font-bold text-white/50">No robots. No shadowbans. Faith welcome. Respect required.</p>
      <p className="mt-3 font-black text-amber-300 tracking-widest text-xs">Speak Freely. Love Your Neighbor.</p>
    </div>
  )
}
