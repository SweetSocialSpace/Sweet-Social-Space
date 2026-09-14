'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Español', ja: '日本語', fr: 'Français', de: 'Deutsch', pt: 'Português', zh: '中文', ko: '한국어',
}
export const LANGUAGES = Object.keys(LANGUAGE_NAMES)

// THIS IS YOUR DICTIONARY - Every English word -> translated
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  "Faith of the Day": { es: "Fe de Hoy", ja: "今日の信仰", fr: "Foi du Jour", de: "Glaube des Tages", pt: "Fé do Dia", zh: "今日信仰", ko: "오늘의 믿음" },
  "Your Block Has A Feed": { es: "Tu Bloque Tiene Un Feed", ja: "あなたのブロックにフィードがあります", fr: "Votre Quartier a un Fil" },
  "Sign Up": { es: "Registrarse", ja: "サインアップ", fr: "S'inscrire" },
  "Log In": { es: "Iniciar Sesión", ja: "ログイン", fr: "Connexion" },
  "Marketplace": { es: "Mercado", ja: "マーケットプレイス" },
  "Emergency": { es: "Emergencia", ja: "緊急" },
  "Weather": { es: "Clima", ja: "天気" },
  // add every hard English phrase from your platform here
}

const LanguageContext = createContext<any>(null)

export function LanguageProvider({ children }: any) {
  const [lang, setLang] = useState('en')
  const [language, setLanguageState] = useState('en')

  useEffect(() => {
    const browserLang = navigator.language.slice(0,2)
    const saved = localStorage.getItem('sss_lang')
    const finalLang = saved || (LANGUAGE_NAMES[browserLang]? browserLang : 'en')
    setLang(finalLang)
    setLanguageState(finalLang)
    console.log("AUTO DETECTED LANGUAGE:", finalLang)
  }, [])

  const t = (key: string) => TRANSLATIONS[key]?.[language] || key

  const setLanguage = (newLang: string) => {
    setLang(newLang)
    setLanguageState(newLang)
    localStorage.setItem('sss_lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, language, setLang: setLanguage, setLanguage, t, LANGUAGE_NAMES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
