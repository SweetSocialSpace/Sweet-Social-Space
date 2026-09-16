'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

const LEGAL = { entityName: 'Sweet Social Space' }

export function LegalFooter() {
  const { language } = useLanguage()
  const t = useTranslations() as any
  const isEs = language?.startsWith('es')

  const L = {
    securityPolicy: t?.legal?.securityPolicy || (isEs ? 'Política de Seguridad' : 'Security Policy'),
    terms: t?.legal?.terms || (isEs ? 'Términos' : 'Terms'),
    privacy: t?.legal?.privacy || (isEs ? 'Privacidad' : 'Privacy'),
    cookies: t?.legal?.cookies || 'Cookies',
    communityGuidelines: t?.legal?.communityGuidelines || (isEs ? 'Normas de la Comunidad' : 'Community Guidelines'),
    dmca: t?.legal?.dmca || 'DMCA',
    contact: t?.legal?.contact || (isEs ? 'Contacto' : 'Contact'),
    verification: t?.legal?.verification || (isEs ? 'Verificación' : 'Verification'),
    allRights: t?.legal?.allRights || (isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'),
    worksAnywhere: t?.legal?.worksAnywhere || (isEs ? 'Funciona en Cualquier Lugar' : 'Works Anywhere'),
    sslSecured: t?.legal?.sslSecured || (isEs ? 'SSL SEGURO' : 'SSL SECURED'),
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
