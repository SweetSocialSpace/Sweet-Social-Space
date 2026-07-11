import './globals.css'
import '@fontsource/sora/400.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import Link from 'next/link'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Sweet Social Space',
  description: 'Sweet Social Space is a community platform for open, uncensored local communication and connection.',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SweetSocial',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Sweet Social Space',
    description: 'Sweet Social Space is a community platform for open, uncensored local communication and connection.',
    type: 'website',
    images: ['https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f2057e7-075f-4388-9d6f-3f413dae4b8c/id-preview-28209b7a--b94e3455-6a16-40de-8102-13b4b19ca474.lovable.app-1779936921942.png'],
  },
  twitter: {
    card: 'summary',
    site: '@SweetSocial',
    title: 'Sweet Social Space',
    description: 'Sweet Social Space is a community platform for open, uncensored local communication and connection.',
    images: ['https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f2057e7-075f-4388-9d6f-3f413dae4b8c/id-preview-28209b7a--b94e3455-6a16-40de-8102-13b4b19ca474.lovable.app-1779936921942.png'],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Manrope, sans-serif' }} className="font-sans antialiased">
        <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">Sweet Social Space</Link>
            <nav className="flex gap-4 text-sm">
              
            </nav>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-3xl mx-auto px-4 py-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Sweet Social Space — Speak Freely. Love your neighbor.
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
