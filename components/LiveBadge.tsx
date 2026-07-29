export default function LiveBadge({ isLive }: { isLive?: boolean }) {
  return <span className={`text- font-black px-2 py-0.5 rounded-full ${isLive ? 'bg-green-500 text-black' : 'bg-white/10 text-white/30'}`}>LIVE</span>
}
