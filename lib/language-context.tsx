'use client'
import { createContext, useContext, useEffect, useState } from 'react'

// ADD THIS BACK - your build needs it
export const LANGUAGE_NAMES: any = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
}

export const LANGUAGES = Object.keys(LANGUAGE_NAMES)

const translations: any = {
  en: { "Faith of the Day": "Faith of the Day", "Your Block Has A Feed": "Your Block Has A Feed", "Sign Up": "Sign Up" },
  es: { "Faith of the Day": "Fe de Hoy", "Your Block Has A Feed": "Tu Bloque Tiene Un Feed", "Sign Up": "Registrarse" },
  ja: { "Faith of the Day": "今日の信仰", "Your Block Has A Feed": "あなたのブロックにフィードがあります", "Sign Up": "サインアップ" },
  fr: { "Faith of the Day": "Foi du Jour", "Your Block Has A Feed": "Votre Quartier a un Fil", "Sign Up": "S'inscrire" },
  de: { "Faith of the Day": "Glaube des Tages", "Your Block Has A Feed": "Dein Block hat einen Feed" },
  pt: { "Faith of the Day": "Fé do Dia", "Your Block Has A Feed": "Seu Bloco Tem Um Feed" },
  zh: { "Faith of the Day": "今日信仰", "Your Block Has A Feed": "你的街区有动态" },
  ko: { "Faith of the Day": "오늘의 믿음", "Your Block Has A Feed": "당신의 블록에 피드가 있습니다" },
}

const LanguageContext = createContext<any>(null)

export function LanguageProvider({ children }: any) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    // AUTO-CONFIG - THIS IS YOUR ONE TASK
    const browserLang = navigator.language.slice(0,2)
    const saved = localStorage.getItem('sss_lang')
    const finalLang = saved || (translations[browserLang]? browserLang : 'en')
    setLang(finalLang)
    console.log("AUTO DETECTED LANGUAGE:", finalLang, "browser:", navigator.language)
  }, [])

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key
  }

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
