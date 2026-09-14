'use client'
import { LanguageProvider } from '@/lib/language-context'
import GlobalTranslator from '@/components/GlobalTranslator'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <GlobalTranslator />
      {children}
    </LanguageProvider>
  )
}
