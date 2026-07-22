import './globals.css'
import { LocationProvider } from '@/lib/location-context'

export const metadata = {
  title: 'Sweet Social Space',
  description: 'Speak Freely. Love your neighbor.',
}

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <LocationProvider>
          {children}
        </LocationProvider>
      </body>
    </html>
  )
}
