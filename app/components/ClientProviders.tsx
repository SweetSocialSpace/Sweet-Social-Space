'use client'
import { LanguageProvider } from '@/lib/language-context'
import GlobalTranslator from '@/components/GlobalTranslator'
import { LocationProvider } from '@/lib/location-context'
import { LocationScopeProvider } from '@/hooks/useLocationScope'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LocationProvider>
        <LocationScopeProvider>
          <GlobalTranslator />
          {children}
        </LocationScopeProvider>
      </LocationProvider>
    </LanguageProvider>
  )
}
