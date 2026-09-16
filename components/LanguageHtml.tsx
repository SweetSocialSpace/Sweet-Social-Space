'use client'
import { useEffect } from 'react'
import { useLanguage, RTL_LANGUAGES } from '@/lib/language-context'

export default function LanguageHtml({ children }: { children: React.ReactNode }) {
  const { language, isRTL } = useLanguage() as any

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (typeof document!== 'undefined') {
        // Set language
        document.documentElement.lang = language

        // Set direction - use context isRTL if available, fallback to check
        const rtl = typeof isRTL === 'boolean'
         ? isRTL
          : RTL_LANGUAGES.includes(language)
        document.documentElement.dir = rtl? 'rtl' : 'ltr'

        // Also set body dir for extra compatibility
        document.body.dir = rtl? 'rtl' : 'ltr'
      }
    } catch (e) {
      console.warn('[LanguageHtml] Failed to set html lang/dir', e)
    }
  }, [language, isRTL])

  // Also run once on mount to catch the initial language from localStorage immediately
  // This prevents the English -> Spanish flash
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('sss_lang')
      if (saved && typeof document!== 'undefined') {
        document.documentElement.lang = saved
        document.documentElement.dir = RTL_LANGUAGES.includes(saved as any)? 'rtl' : 'ltr'
      }
    } catch {}
  }, [])

  return <>{children}</>
}
