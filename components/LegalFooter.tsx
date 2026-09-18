'use client'
import Link from 'next/link'
import { useTranslations } from '@/lib/translations'

const LEGAL = { entityName: 'Sweet Social Space' }

export function LegalFooter() {
  const t = useTranslations() as any

  const L = {
    securityPolicy: t?.legal?.securityPolicy,
    terms: t?.legal?.terms,
    privacy: t?.legal?.privacy,
    cookies: t?.legal?.cookies,
    communityGuidelines: t?.legal?.communityGuidelines,
    dmca: t?.legal?.dmca,
    contact: t?.legal?.contact,
    verification: t?.legal?.verification,
    allRights: t?.legal?.allRights,
    worksAnywhere: t?.legal?.worksAnywhere,
    sslSecured: t?.legal?.sslSecured,
  }

  return (
    <footer className="mt-12 border-t border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-muted-foreground">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/legal/security" className="hover:text-foreground font-medium text-foreground">🛡 {L.securityPolicy}</Link>
          <Link href="/legal/terms" className="hover:text-foreground">{L.terms}</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">{L.privacy}</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">{L.cookies}</Link>
          <Link href="/legal/guarantees" className="hover:text-foreground">{L.communityGuidelines}</Link>
          <Link href="/legal/legal" className="hover:text-foreground">{L.dmca}</Link>
          <Link href="/legal/contact" className="hover:text-foreground">{L.contact}</Link>
          <Link href="/legal/verification" className="hover:text-foreground">{L.verification}</Link>
        </nav>
        <p className="mt-4">© {new Date().getFullYear()} {LEGAL.entityName}. {L.allRights} {L.worksAnywhere} • {L.sslSecured}</p>
      </div>
    </footer>
  )
}
export default LegalFooter
