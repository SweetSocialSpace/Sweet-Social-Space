import Link from 'next/link'

// TODO: Port lib/legal.ts from Lovable later
const LEGAL = {
  entityName: 'Sweet Social Space'
}

export function LegalFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-muted-foreground">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/safety" className="hover:text-foreground font-medium text-foreground">🛡 Safety & Trust</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link href="/community-guidelines" className="hover:text-foreground">Community Guidelines</Link>
          <Link href="/dmca" className="hover:text-foreground">DMCA</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
        <p className="mt-4">© {new Date().getFullYear()} {LEGAL.entityName}. All rights reserved.</p>
      </div>
    </footer>
  )
}
