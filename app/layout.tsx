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
        /* app/globals.css */
:root {
  --bg-warm: #FAFAF9; /* warm white */
  --bg-dark: #1C1917; /* warm charcoal */
  --card-light: #FFFFFF;
  --card-dark: #374151;
  --text-light: #1F2937;
  --text-dark: #F3F4F6;
}

body {
  background-color: var(--bg-warm);
  background-image: url('/backgrounds/heart-tears-gold.webp');
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* The magic: blend the image so it’s barely there */
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-color: var(--bg-warm);
  opacity: 0.96; /* 4% image shows through */
  pointer-events: none;
  z-index: -1;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  body {
    background-color: var(--bg-dark);
  }
  body::before {
    background-color: var(--bg-dark);
    opacity: 0.94; /* 6% image shows through */
  }
}

/* Cards stay solid for readability */
.card {
  background: var(--card-light);
  color: var(--text-light);
}
@media (prefers-color-scheme: dark) {
  .card {
    background: var(--card-dark);
    color: var(--text-dark);
  }
}
        <footer className="w-full py-6 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4">
            © 2026 Sweet Social Space — Speak Freely. Love your neighbor.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link> |{' '}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link> |{' '}
           <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
