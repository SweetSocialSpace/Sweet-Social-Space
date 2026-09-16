import './globals.css'
import { LocationProvider } from '@/lib/location-context'
import type { Metadata, Viewport } from 'next'
import { LanguageProvider } from '@/lib/language-context'
import LanguageHtml from '@/components/LanguageHtml'

export const metadata: Metadata = {
  title: 'Sweet Social Space • Your Neighborhood',
  description: "Facebook shows you the world. We show you your Neighborhood - 5,10,15,20 miles of YOU",
  manifest: '/manifest.json'
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang is intentionally NOT hardcoded here - LanguageHtml component sets it dynamically
    // from localStorage/cookie to prevent hydration mismatch. suppressHydrationWarning allows
    // client to update lang/dir without React warning. This fixes SEO/accessibility flash.
    <html className="bg-black" suppressHydrationWarning>
      <body
        style={{
          backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: '#000',
          minHeight: '100vh'
        }}
        className="antialiased"
      >
        <div className="fixed inset-0 bg-black/40 -z-10 pointer-events-none" />
        <LocationProvider>
          <LanguageProvider>
            <LanguageHtml>
              <div className="relative z-10 min-h-screen">{children}</div>
            </LanguageHtml>
          </LanguageProvider>
        </LocationProvider>
      </body>
    </html>
  )
}
