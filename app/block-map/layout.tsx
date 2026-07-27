import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Block Map • GLOBAL • Sweet Social Space',
  description: 'Live block map - global independent vertebrae - auto-detected'
}

export default function BlockMapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="block-map-body min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
      <div className="fixed bottom-2 left-2 right-2 flex justify-center pointer-events-none">
        <div className="text-white/20 text- uppercase tracking-widest bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10">
          BLOCK MAP • GLOBAL • LIVE • AUTO-DETECTED • VERTEBRAE • INDEPENDENT • FAILSAFE • NEVER SHOWS YOUR BLOCK
        </div>
      </div>
    </div>
  )
}
