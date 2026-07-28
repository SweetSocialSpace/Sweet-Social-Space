import Link from 'next/link'
import type { ReactNode } from 'react'
export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: '0', zIndex: -2, backgroundImage: "url('/golden_droplet_heart_wallpaper.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: '0', zIndex: -1, background: 'rgba(0,0,0,0.18)' }} />
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '20px', background: 'rgba(0,0,0,0.32)' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: '700', color: '#fff', textDecoration: 'none' }}>Sweet Social Space • GLOBAL</Link>
          <Link href="/feed" style={{ fontSize: '14px', color: '#ddd', textDecoration: 'none' }}>Feed →</Link>
        </div>
      </header>
      <main style={{ maxWidth: '768px', margin: '0 auto', width: '100%', flex: '1', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>{title}</h1>
        <p style={{ fontSize: '13px', color: '#bbb', marginBottom: '32px' }}>Last updated: {updated}</p>
        <div style={{ lineHeight: '1.8', fontSize: '15px', color: '#eee', background: 'rgba(0,0,0,0.30)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>{children}</div>
      </main>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#aaa', background: 'rgba(0,0,0,0.32)' }}>
        © Sweet Social Space • GLOBAL • SSL SECURED • <Link href="/legal/terms" style={{ marginLeft: '8px', color: '#ccc' }}>Terms</Link> • <Link href="/legal/privacy" style={{ marginLeft: '8px', color: '#ccc' }}>Privacy</Link> • <Link href="/legal/contact" style={{ marginLeft: '8px', color: '#ccc' }}>Contact</Link>
      </footer>
    </div>
  )
}
