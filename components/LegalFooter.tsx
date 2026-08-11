import Link from 'next/link'

const LEGAL = { entityName: 'Sweet Social Space' }

export function LegalFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-muted-foreground">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/legal/security" className="hover:text-foreground font-medium text-foreground">🛡 Security Policy</Link>
          <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">Cookies</Link>
          <Link href="/legal/guarantees" className="hover:text-foreground">Community Guidelines</Link>
          <Link href="/legal/legal" className="hover:text-foreground">DMCA</Link>
          <Link href="/legal/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/legal/verification" className="hover:text-foreground">Verification</Link>
        </nav>
        <p className="mt-4">© {new Date().getFullYear()} {LEGAL.entityName}. All rights reserved. Works Anywhere • SSL SECURED</p>
      </div>
    </footer>
  )
}
