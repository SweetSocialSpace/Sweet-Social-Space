import './globals.css'
import { LocationProvider } from '@/lib/location-context'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Sweet Social Space • GLOBAL • Your Block • Live',
  description: 'Facebook shows you the world. We show you your block - 10 miles of YOU - wherever you are in the world - GLOBAL independent vertebrae',
  manifest: '/manifest.json'
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body style={{ backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundColor: '#000', minHeight: '100vh' }} className="antialiased">
        <div className="fixed inset-0 bg-black/40 -z-10 pointer-events-none" />
        <LocationProvider>
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </LocationProvider>
      </body>
    </html>
  )
}
