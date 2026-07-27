import type { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      <main className="flex-grow relative z-10">{children}</main>
      <footer className="w-full py-6 text-center text-xs text-white/30 bg-black/50 backdrop-blur-2xl border-t border-white/10 relative z-10">
        <div>© {new Date().getFullYear()} Sweet Social Space • Speak Freely. Love your neighbor. • GLOBAL • VERTEBRAE • Independent • Always-Automated • FAILSAFE • Never YOUR BLOCK</div>
        <div className="mt-1 text- uppercase tracking-widest text-white/20">GLOBAL • LIVE • Auto-detected • House Never Dies</div>
      </footer>
    </div>
  )
}
