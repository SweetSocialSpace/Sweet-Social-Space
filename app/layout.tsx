import './globals.css'
import { LocationProvider } from '@/lib/location-context'

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="en">
      <body style={{margin:0, backgroundImage:"url('/hearts-bg.jpg')", backgroundSize:'cover', backgroundAttachment:'fixed', backgroundColor:'#1a0a00'}}>
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  )
}
