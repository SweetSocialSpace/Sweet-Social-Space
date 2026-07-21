import './globals.css'
import Link from 'next/link'
import { LocationProvider } from '@/lib/location-context'

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
        <LocationProvider>
          <main className="flex-grow">
            {children}
          </main>
        </LocationProvider>

        <footer className="w-full py-6 text-center text-xs text-zinc-300 bg-black/30 backdrop-blur border-t border-white/10">
          © {new Date().getFullYear()} Sweet Social Space • Speak Freely. Love your neighbor.
        </footer>
      </body>
    </html>
  )
}
