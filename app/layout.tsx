import { LanguageProvider } from '@/lib/language-context'

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
