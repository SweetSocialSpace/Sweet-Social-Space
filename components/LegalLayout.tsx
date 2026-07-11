import Link from 'next/link'
import type { ReactNode } from 'react'
import { LegalFooter } from './LegalFooter'

// TODO: Replace with real logo from /public or port assets system
const logo = '/sweet-social-logo.png' // Put your logo in public/sweet-social-logo.png

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <img src={logo} alt="Sweet Social Space" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-display text-lg font-semibold">Sweet Social Space</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* TODO: Port LanguageSwitcher from lib/i18n.ts */}
            <Link href="/feed" className="text-sm text-muted-foreground hover:text-foreground">Feed →</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 prose prose-sm dark:prose-invert prose-headings:font-display prose-headings:font-semibold">
        <h1>{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
        {children}
      </main>
      <LegalFooter />
    </div>
  )
}
