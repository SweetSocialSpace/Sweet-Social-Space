import './globals.css'
import Link from 'next/link'


export const metadata = {
  title: 'Sweet Social Space',
  description: 'Speak Freely. Love your neighbor.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">Sweet Social Space</Link>
            <nav className="flex gap-4 text-sm">
              <Link className="navlink" href="/feed">Feed</Link>
              <Link className="navlink" href="/vent">Vent</Link>
              <Link className="navlink" href="/faith">Faith</Link>
              <Link className="navlink" href="/alerts">Alerts</Link>
            </nav>
            <AuthButton />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-3xl mx-auto px-4 py-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Sweet Social Space — Speak Freely. Love your neighbor.
        </footer>
      </body>
    </html>
  )
}
