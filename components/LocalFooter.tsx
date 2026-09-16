'use client'
import Link from 'next/link'
import { useTranslations } from '@/lib/translations'

export default function LocalFooter() {
  const t = useTranslations() as any
  return (
    <footer className="w-full bg-black/80 backdrop-blur border-t border-white/10 mt-10 py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.verify || 'VERIFICAR'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/apply-verification" className="hover:text-white">{t?.footer?.verification || 'Verificación'}</Link></li>
            <li><Link href="/legal/security" className="hover:text-white">{t?.footer?.securitySsl || 'Seguridad • SSL Seguro'}</Link></li>
            <li><Link href="/trust" className="hover:text-white">{t?.footer?.trustMeter || 'Medidor de Confianza'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.legal || 'LEGAL'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/legal/terms" className="hover:text-white">{t?.footer?.termsOfUse || 'Términos de Uso'}</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-white">{t?.footer?.privacyPolicy || 'Política de Privacidad'}</Link></li>
            <li><Link href="/legal/legal" className="hover:text-white">{t?.footer?.legalDmca || 'Legal • DMCA'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.guarantees || 'GARANTÍAS'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/legal/guarantees" className="hover:text-white">{t?.footer?.ourGuarantees || 'Nuestras Garantías'}</Link></li>
            <li><Link href="/faith" className="hover:text-white">{t?.footer?.faithCorner || 'Rincón de Fe'}</Link></li>
            <li><Link href="/failsafe" className="hover:text-white">{t?.footer?.failsafe || 'A Prueba de Fallos'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.contact || 'CONTACTO'}</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/contact" className="hover:text-white">{t?.footer?.contactUs || 'Contáctanos'}</Link></li>
            <li><Link href="/about" className="hover:text-white">{t?.footer?.about || 'Acerca de'}</Link></li>
            <li><Link href="/support" className="hover:text-white">{t?.footer?.support || 'Soporte'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-widest mb-3">{t?.footer?.platform || 'PLATAFORMA'}</h4>
          <p className="text-white/40 text-xs leading-relaxed">
           {t?.footer?.platformTagline || 'INDEPENDIENTE • A PRUEBA DE FALLOS • SSL SEGURO • 100% VERIFICADO • Nos importa tu privacidad'} 
          </p>
          <p className="mt-3 text-white/20 text-xs">© 2026 Sweet Social Space</p>
        </div>
      </div>
    </footer>
  )
}
