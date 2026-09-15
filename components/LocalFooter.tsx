'use client'
import Link from 'next/link'
import { useTranslations } from '@/lib/translations'

export default function LocalFooter() {
  const t = useTranslations() as any
  return (
    <footer className="w-full bg-black/80 backdrop-blur border-t border-white/10 mt-10 py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.verify || 'Verify'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/apply-verification" className="hover:text-white">{t?.footer?.verification || 'Verification'}</Link></li>
            <li><Link href="/legal/security" className="hover:text-white">{t?.footer?.securitySsl || 'Security • SSL Secured'}</Link></li>
            <li><Link href="/trust" className="hover:text-white">{t?.footer?.trustMeter || 'Trust Meter'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.legal || 'Legal'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/legal/terms" className="hover:text-white">{t?.footer?.termsOfUse || 'Terms of Use'}</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-white">{t?.footer?.privacyPolicy || 'Privacy Policy'}</Link></li>
            <li><Link href="/legal/legal" className="hover:text-white">{t?.footer?.legalDmca || 'Legal • DMCA'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.guarantees || 'Guarantees'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/legal/guarantees" className="hover:text-white">{t?.footer?.ourGuarantees || 'Our Guarantees'}</Link></li>
            <li><Link href="/faith" className="hover:text-white">{t?.footer?.faithCorner || 'Faith Corner'}</Link></li>
            <li><Link href="/failsafe" className="hover:text-white">{t?.footer?.failsafe || 'Failsafe'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.contact || 'Contact'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/contact" className="hover:text-white">{t?.footer?.contactUs || 'Contact Us'}</Link></li>
            <li><Link href="/about" className="hover:text-white">{t?.footer?.about || 'About'}</Link></li>
            <li><Link href="/support" className="hover:text-white">{t?.footer?.support || 'Support'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.platform || 'Platform'}</h4>
          <p className="text-white/40 text-xs leading-relaxed">
           {t?.footer?.platformTagline || 'INDEPENDENT • FAILSAFE • SSL SECURED • 100% VERIFIED • We care about your privacy'} 
          </p>
          <p className="mt-3 text-white/20 text-xs">© 2026 Sweet Social Space</p>
        </div>
      </div>
    </footer>
  )
}
