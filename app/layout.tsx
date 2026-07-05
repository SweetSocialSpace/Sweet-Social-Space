import './globals.css'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'

export const metadata = {
  title: 'Sweet Social Space',
  description: 'Neighbors talking to neighbors – speak freely, find faith, stay informed.'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">Sweet Social Space</Link>
            <nav className="flex gap-2 text-sm">
              <Link className="navlink" href="/">Feed</Link>
              <Link className="navlink" href="/vent">Vent</Link>
              <Link className="navlink" href="/faith">Faith</Link>
              <Link className="navlink" href="/alerts">Alerts</Link>
            </nav>
            <div className="text-sm">
              {user ? <a href="/login" className="navlink">{user.email?.split('@')[0]}</a> : <a href="/login" className="btn-ghost">Sign in</a>}
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-3xl mx-auto px-4 py-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Sweet Social Space – sweetsocialspace.com – Speak freely. Love your neighbor.
        </footer>
      </body>
    </html>
  )
}
