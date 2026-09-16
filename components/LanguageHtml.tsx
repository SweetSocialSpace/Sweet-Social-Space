'use client'
import { useEffect } from 'react'
import { useLanguage, RTL_LANGUAGES } from '@/lib/language-context'

export default function LanguageHtml({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()
  useEffect(()=>{
    if (typeof window === 'undefined') return
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language
        document.documentElement.dir = (RTL_LANGUAGES as any).includes(language) ? 'rtl' : 'ltr'
      }
    } catch {}
  }, [language])
  return <>{children}</>
}
