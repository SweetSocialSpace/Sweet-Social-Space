export default function WelcomePost() {
  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center font-black text-black">AI</div>
        <div>
          <p className="font-black text-sm tracking-wide">AI MAYOR • LIVE • Pinned for new neighbors</p>
          <p className="text-xs text-white/60">Posting as • YOUR BLOCK • Welcome</p>
        </div>
      </div>

      <h3 className="text-xl font-black mb-3">🎉 You found us. Welcome to your private block.</h3>
      <p className="text-white/80 mb-4">This is YOUR space within 10 miles of you — not the whole internet.</p>
      
      <p className="font-bold mb-2">3 ways to start:</p>
      <ol className="list-decimal list-inside space-y-1 text-white/90 mb-4 text-sm">
        <li>Say hi and tell us your cross streets (no exact address needed)</li>
        <li>Post one thing you need or one thing you can give</li>
        <li>Tap "Use my location" to unlock your Block Map</li>
      </ol>

      <p className="text-sm text-white/60">No robots. No shadowbans. Faith welcome. Respect required.</p>
      <p className="mt-3 font-black text-amber-300 tracking-widest text-sm">Speak Freely. Love Your Neighbor.</p>
    </div>
  )
}
