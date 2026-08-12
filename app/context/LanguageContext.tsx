'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const translations: any = {
  en: { welcome: "Your Neighborhood", neighbors: "Neighbors First" },
  es: { welcome: "Tu Vecindario", neighbors: "Vecinos Primero" },
  // add your other languages here
}

const LanguageContext = createContext<any>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('sss_lang')
    if (saved) setLang(saved)
  }, [])

  const changeLang = (newLang: string) => {
    setLang(newLang)
    localStorage.setItem('sss_lang', newLang)
    document.documentElement.lang = newLang
    console.log('Language changed to:', newLang) // to confirm it's firing
  }

  const t = (key: string) => translations[lang]?.[key] || translations['en']?.[key] || key

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t, translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
