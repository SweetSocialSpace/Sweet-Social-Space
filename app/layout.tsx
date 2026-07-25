import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body 
        style={{
          backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: '#000',
          minHeight: '100vh'
        }}
      >
        <div className="fixed inset-0 bg-black/40 -z-10" />
        {children}
      </body>
    </html>
  )
}
