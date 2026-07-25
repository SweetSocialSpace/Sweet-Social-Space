import { BlockSystemProvider } from '@/lib/block-system/provider'
import { LocationProvider } from '@/lib/location-context'

export default function RootLayout({ children }) {
  return (
    <html>
      <body style={{backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')`}}>
        <BlockSystemProvider>
          <LocationProvider>
            <div className="fixed inset-0 bg-black/40 -z-10" />
            {children}
          </LocationProvider>
        </BlockSystemProvider>
      </body>
    </html>
  )
}
