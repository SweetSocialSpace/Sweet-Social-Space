'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt' | 'it' | 'nl'

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  ar: 'العربية',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands'
}

type CtxType = {
  language: Language
  setLanguage: (lang: Language) => void
  languageName: string
}

const LanguageContext = createContext<CtxType>({
  language: 'en',
  setLanguage: () => {},
  languageName: 'English'
})

export function LanguageProvider({ children }: any) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('sss_language') as Language
    if (saved && LANGUAGE_NAMES[saved]) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('sss_language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageName: LANGUAGE_NAMES[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
