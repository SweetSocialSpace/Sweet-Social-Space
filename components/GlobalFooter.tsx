import Link from 'next/link'

export default function GlobalFooter() {
  return (
    <footer className="w-full bg-black/80 backdrop-blur border-t border-white/10 mt-10 py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">Verify</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/verification" className="hover:text-white">Verification • GLOBAL</Link></li>
            <li><Link href="/security" className="hover:text-white">Security • SSL Secured</Link></li>
            <li><Link href="/trust" className="hover:text-white">Trust Meter • LIVE</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">Legal</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/legal" className="hover:text-white">Legal • DMCA</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">Guarantees</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/guarantees" className="hover:text-white">Our Guarantees</Link></li>
            <li><Link href="/faith" className="hover:text-white">Faith Policy</Link></li>
            <li><Link href="/failsafe" className="hover:text-white">Failsafe • Vertebrae</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">Contact</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-white">About • GLOBAL</Link></li>
            <li><Link href="/support" className="hover:text-white">Support • LIVE</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">Platform</h4>
          <p className="text-white/40 text-xs leading-relaxed">
            GLOBAL • LIVE • INDEPENDENT • FAILSAFE • SSL SECURED • 100% VERIFIED • PRIVATE TO 10 MILES OF YOU
          </p>
          <p className="mt-3 text-white/20 text-xs">© 2026 Sweet Social Space</p>
        </div>
      </div>
    </footer>
  )
}
