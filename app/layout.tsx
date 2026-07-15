import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Sweet Social Space',
  description: 'Speak Freely. Love your neighbor.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>

        <footer className="w-full py-6 text-center text-xs text-zinc-300 bg-black/30 backdrop-blur border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4">
            © 2026 Sweet Social Space — Speak Freely. Love your neighbor.Ask Yourself What would Jesus do?
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link> |{' '}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link> |{' '}
            <Link href="/contact" className="hover:underline">Contact</Link> |{' '}
            <Link href="/ About" className="hover:underline"> About </Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
