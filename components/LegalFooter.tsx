'use client'
import Link from 'next/link'
import { useTranslations } from '@/lib/translations'

const LEGAL = { entityName: 'Sweet Social Space' }

export function LegalFooter() {
  const t = useTranslations() as any
  return (
    <footer className="mt-12 border-t border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-muted-foreground">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/legal/security" className="hover:text-foreground font-medium text-foreground">🛡 {t?.legal?.securityPolicy || 'Política de Seguridad'}</Link>
          <Link href="/legal/terms" className="hover:text-foreground">{t?.legal?.terms || 'Términos'}</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">{t?.legal?.privacy || 'Privacidad'}</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">{t?.legal?.cookies || 'Cookies'}</Link>
          <Link href="/legal/guarantees" className="hover:text-foreground">{t?.legal?.communityGuidelines || 'Normas de la Comunidad'}</Link>
          <Link href="/legal/legal" className="hover:text-foreground">{t?.legal?.dmca || 'DMCA'}</Link>
          <Link href="/legal/contact" className="hover:text-foreground">{t?.legal?.contact || 'Contacto'}</Link>
          <Link href="/legal/verification" className="hover:text-foreground">{t?.legal?.verification || 'Verificación'}</Link>
        </nav>
        <p className="mt-4">© {new Date().getFullYear()} {LEGAL.entityName}. {t?.legal?.allRights || 'Todos los derechos reservados.'} {t?.legal?.worksAnywhere || 'Funciona en Cualquier Lugar'} • {t?.legal?.sslSecured || 'SSL SEGURO'}</p>
      </div>
    </footer>
  )
}

export default LegalFooter
