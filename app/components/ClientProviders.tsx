'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'id', name: 'Indonesia' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'th', name: 'ไทย' },
  { code: 'sv', name: 'Svenska' },
  { code: 'pl', name: 'Polski' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'uk', name: 'Українська' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'he', name: 'עברית' },
  { code: 'ur', name: 'اردو' },
  { code: 'fa', name: 'فارسی' },
  { code: 'ms', name: 'Melayu' },
  { code: 'ro', name: 'Română' },
  { code: 'cs', name: 'Čeština' },
  { code: 'hu', name: 'Magyar' },
  { code: 'fi', name: 'Suomi' },
  { code: 'no', name: 'Norsk' },
  { code: 'da', name: 'Dansk' },
  { code: 'bg', name: 'Български' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'sr', name: 'Српски' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'et', name: 'Eesti' },
  { code: 'lv', name: 'Latviešu' },
  { code: 'lt', name: 'Lietuvių' },
  { code: 'be', name: 'Беларуская' },
  { code: 'ka', name: 'ქართული' },
  { code: 'hy', name: 'Հայերեն' },
  { code: 'az', name: 'Azərbaycan' },
  { code: 'kk', name: 'Қазақша' },
  { code: 'ky', name: 'Кыргызча' },
  { code: 'uz', name: "O'zbek" },
  { code: 'tg', name: 'Тоҷикӣ' },
  { code: 'mn', name: 'Монгол' },
  { code: 'km', name: 'ខ្មែរ' },
  { code: 'lo', name: 'ລາວ' },
  { code: 'my', name: 'မြန်မာ' },
] as const

type LangCode = typeof SUPPORTED_LANGUAGES[number]['code']

const LanguageContext = createContext<{
  language: LangCode
  setLanguage: (l: LangCode) => void
}>({ language: 'en', setLanguage: () => {} })

export function useLanguage() {
  return useContext(LanguageContext)
}

// This is the provider that now lives INSIDE ClientProviders.tsx
function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<LangCode>('en')

  useEffect(() => {
    const saved = localStorage.getItem('sss_lang') as LangCode | null
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      setLang(saved)
    }
  }, [])

  const setLanguage = (l: LangCode) => {
    setLang(l)
    localStorage.setItem('sss_lang', l)
    console.log(`[BRAIN CHECK] Lang: ${l} Filter All: ${l === 'es'? 'Todos' : l}`)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}
