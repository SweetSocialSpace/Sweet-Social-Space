'use client'
import Link from 'next/link'
import { useTranslations } from '@/lib/translations'

export default function LocalFooter() {
  const t = useTranslations() as any

  const F = {
    verify: t?.footer?.verify,
    verification: t?.footer?.verification,
    securitySsl: t?.footer?.securitySsl,
    trustMeter: t?.footer?.trustMeter,
    legal: t?.footer?.legal,
    termsOfUse: t?.footer?.termsOfUse,
    privacyPolicy: t?.footer?.privacyPolicy,
    legalDmca: t?.footer?.legalDmca,
    guarantees: t?.footer?.guarantees,
    ourGuarantees: t?.footer?.ourGuarantees,
    faithCorner: t?.footer?.faithCorner,
    failsafe: t?.footer?.failsafe,
    contact: t?.footer?.contact,
    contactUs: t?.footer?.contactUs,
    about: t?.footer?.about,
    support: t?.footer?.support,
    platform: t?.footer?.platform,
    platformTagline: t?.footer?.platformTagline,
  }

  return (
    <footer className="w-full bg-black/80 backdrop-blur border-t border-white/10 mt-10 py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{F.verify}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/apply-verification" className="hover:text-white">{F.verification}</Link></li>
            <li><Link href="/legal/security" className="hover:text-white">{F.securitySsl}</Link></li>
            <li><Link href="/trust" className="hover:text-white">{F.trustMeter}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{F.legal}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/legal/terms" className="hover:text-white">{F.termsOfUse}</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-white">{F.privacyPolicy}</Link></li>
            <li><Link href="/legal/legal" className="hover:text-white">{F.legalDmca}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{F.guarantees}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/legal/guarantees" className="hover:text-white">{F.ourGuarantees}</Link></li>
            <li><Link href="/faith" className="hover:text-white">{F.faithCorner}</Link></li>
            <li><Link href="/failsafe" className="hover:text-white">{F.failsafe}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{F.contact}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/contact" className="hover:text-white">{F.contactUs}</Link></li>
            <li><Link href="/about" className="hover:text-white">{F.about}</Link></li>
            <li><Link href="/support" className="hover:text-white">{F.support}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{F.platform}</h4>
          <p className="text-white/40 text-xs leading-relaxed">{F.platformTagline}</p>
          <p className="mt-3 text-white/20 text-xs">© 2026 Sweet Social Space</p>
        </div>
      </div>
    </footer>
  )
}
