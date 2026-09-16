'use client'
import { useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'

const RTL_LANGS = ['ar','he','ur','fa']

export default function LanguageHtml({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language
        document.documentElement.dir = RTL_LANGS.includes(language) ? 'rtl' : 'ltr'
      }
    } catch {}
  }, [language])
  return <>{children}</>
}
