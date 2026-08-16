'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

export function isSupportedLanguage(
  value: string | null | undefined
): value is Language {
  return !!value &&
    Object.prototype.hasOwnProperty.call(LANGUAGE_NAMES, value)
}

function detectBrowserLanguage(): Language {
  const code = (navigator.language || 'en')
    .toLowerCase()
    .split('-')[0]

  return isSupportedLanguage(code) ? code : 'en'
}

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

export function LanguageProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [language, setLanguageState] = useState<Language>('en')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let cancelled = false

    const initializeLanguage = async () => {
      /*
       * 1. Explicit user choice wins.
       */
      const saved = localStorage.getItem('sss_language')

      if (isSupportedLanguage(saved)) {
        setLanguageState(saved)
        setInitialized(true)
        return
      }

      /*
       * 2. Existing subscriber preference.
       */
      try {
        const supabase = createClient()

        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .or(`user_id.eq.${user.id},id.eq.${user.id}`)
            .maybeSingle()

          if (isSupportedLanguage(profile?.preferred_language)) {
            localStorage.setItem(
              'sss_language',
              profile.preferred_language
            )

            if (!cancelled) {
              setLanguageState(profile.preferred_language)
              setInitialized(true)
            }

            return
          }
        }
      } catch {
        // Fall through to browser detection.
      }

      /*
       * 3. First-time visitor:
       * automatically use their browser/device language.
       */
      const detected = detectBrowserLanguage()

      localStorage.setItem('sss_language', detected)

      if (!cancelled) {
        setLanguageState(detected)
        setInitialized(true)
      }
    }

    initializeLanguage()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!initialized) return

    document.documentElement.lang = language
    document.documentElement.dir =
      RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'
  }, [language, initialized])

  const setLanguage = (newLanguage: Language) => {
    if (!isSupportedLanguage(newLanguage)) return

    setLanguageState(newLanguage)
    localStorage.setItem('sss_language', newLanguage)

    /*
     * Persist the subscriber's preferred language.
     */
    void (async () => {
      try {
        const supabase = createClient()

        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!user) return

        await supabase
          .from('profiles')
          .update({
            preferred_language: newLanguage
          })
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      } catch {
        /*
         * Local preference still works even if the profile
         * update is temporarily unavailable.
         */
      }
    })()
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languageName: LANGUAGE_NAMES[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
