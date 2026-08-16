'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Language =
  | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt'
  | 'it' | 'nl' | 'tl' | 'hi' | 'bn' | 'id' | 'vi' | 'th' | 'sv' | 'pl'
  | 'tr' | 'uk' | 'el' | 'he' | 'ur' | 'fa' | 'ms' | 'ro' | 'cs'
  | 'hu' | 'fi' | 'no' | 'da' | 'bg' | 'hr' | 'sr' | 'sk' | 'sl'
  | 'et' | 'lv' | 'lt' | 'be' | 'ka' | 'hy' | 'az' | 'kk' | 'ky'
  | 'uz' | 'tg' | 'mn' | 'km' | 'lo' | 'my'

export const LANGUAGE_NAMES: Record<Language, string> = {
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
  ka: 'ქართული',
  hy: 'Հայերեն',
  az: 'Azərbaycan',
  kk: 'Қазақша',
  ky: 'Кыргызча',
  uz: "O'zbek",
  tg: 'Тоҷикӣ',
  mn: 'Монгол',
  km: 'ខ្មែរ',
  lo: 'ລາວ',
  my: 'မြန်မာ'
}

const RTL_LANGUAGES: Language[] = ['ar', 'he', 'fa', 'ur']

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  languageName: string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  languageName: 'English'
})

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const savedLanguage = localStorage.getItem('sss_language')

  if (
    savedLanguage &&
    Object.prototype.hasOwnProperty.call(
      LANGUAGE_NAMES,
      savedLanguage
    )
  ) {
    return savedLanguage as Language
  }

  return 'en'
}

export function LanguageProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [language, setLanguageState] =
    useState<Language>(getInitialLanguage)

  useEffect(() => {
    localStorage.setItem('sss_language', language)

    document.documentElement.lang = language

    document.documentElement.dir =
      RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'
  }, [language])

  const setLanguage = (newLanguage: Language) => {
    if (!LANGUAGE_NAMES[newLanguage]) {
      console.warn(`Unsupported language: ${newLanguage}`)
      return
    }

    setLanguageState(newLanguage)
  }

  const languageName =
    LANGUAGE_NAMES[language] || LANGUAGE_NAMES.en

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languageName
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * Returns the currently selected platform language
 * and the function used to change it.
 */
export function useLanguage() {
  return useContext(LanguageContext)
}
