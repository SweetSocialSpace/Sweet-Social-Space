'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const translations: any = {
  en: { "Faith of the Day": "Faith of the Day", "Your Block Has A Feed": "Your Block Has A Feed" },
  es: { "Faith of the Day": "Fe de Hoy", "Your Block Has A Feed": "Tu Bloque Tiene Un Feed" },
  ja: { "Faith of the Day": "今日の信仰", "Your Block Has A Feed": "あなたのブロックにフィードがあります" },
  fr: { "Faith of the Day": "Foi du Jour", "Your Block Has A Feed": "Votre Quartier a un Fil" },
  // add all your en.json keys here - copy/paste from translations folder
}

const LanguageContext = createContext<any>(null)

export function LanguageProvider({ children }: any) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    // AUTO-CONFIG - reads user's browser language, not yours
    const browserLang = navigator.language.slice(0,2) // 'ja', 'es', 'en'
    const saved = localStorage.getItem('sss_lang')
    const finalLang = saved || (translations[browserLang]? browserLang : 'en')
    setLang(finalLang)
    console.log("AUTO DETECTED LANGUAGE:", finalLang, "from browser:", navigator.language)
  }, [])

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
