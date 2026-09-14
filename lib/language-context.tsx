'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Español', ja: '日本語', fr: 'Français', de: 'Deutsch', pt: 'Português', zh: '中文', ko: '한국어',
}

export const LANGUAGES = Object.keys(LANGUAGE_NAMES)

const LanguageContext = createContext<any>(null)

export function LanguageProvider({ children }: any) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const browserLang = navigator.language.slice(0,2)
    const saved = localStorage.getItem('sss_lang')
    const finalLang = saved || (LANGUAGE_NAMES[browserLang]? browserLang : 'en')
    setLang(finalLang)
    console.log("AUTO DETECTED LANGUAGE:", finalLang)
  }, [])

  const t = (key: string) => key // for now, just returns the key - we add real translations next

  const setLanguage = (newLang: string) => {
    setLang(newLang)
    localStorage.setItem('sss_lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLanguage, setLanguage, t, LANGUAGE_NAMES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
