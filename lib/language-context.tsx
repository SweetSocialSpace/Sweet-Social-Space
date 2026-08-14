'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Language = 
  | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt' 
  | 'it' | 'nl' | 'tl' | 'hi' | 'bn' | 'id' | 'vi' | 'th' | 'sv' | 'pl' 
  | 'tr' | 'uk' | 'el' | 'he' | 'ur' | 'fa' | 'ms' | 'ro' | 'cs' 
  | 'hu' | 'fi' | 'no' | 'da' | 'bg' | 'hr' | 'sr' | 'sk' | 'sl' 
  | 'et' | 'lv' | 'lt' | 'be' | 'ka' | 'hy' | 'az' | 'kk' | 'ky' 
  | 'uz' | 'tg' | 'mn' | 'km' | 'lo' | 'my'

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
  nl: 'Nederlands',
  tl: 'Filipino',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  sv: 'Svenska',
  pl: 'Polski',
  tr: 'Türkçe',
  uk: 'Українська',
  el: 'Ελληνικά',
  he: 'עברית',
  ur: 'اردو',
  fa: 'فارسی',
  ms: 'Bahasa Melayu',
  ro: 'Română',
  cs: 'Čeština',
  hu: 'Magyar',
  fi: 'Suomi',
  no: 'Norsk',
  da: 'Dansk',
  bg: 'Български',
  hr: 'Hrvatski',
  sr: 'Српски',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  et: 'Eesti',
  lv: 'Latviešu',
  lt: 'Lietuvių',
  be: 'Беларуская',
  ka: 'ქართუული',
  hy: 'Հաեներեն',
  az: 'Azərbaycan',
  kk: 'Қазақша',
  ky: 'Кыргызча',
  uz: 'O\'zbek',
  tg: 'Тоҷикӣ',
  mn: 'Монгол',
  km: 'ខ្មែរ',
  lo: 'ລາວ',
  my: 'မြနမာ'
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
    if (saved && LANGUAGE_NAMES[saved as Language]) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    console.log('Setting language to:', lang) // Debug log
    setLanguageState(lang)
    localStorage.setItem('sss_language', lang)
    // Force document language attribute update
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }

  const languageName = LANGUAGE_NAMES[language as Language] || 'English'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageName }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
