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
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', zh: '中文',
  ja: '日本語', ko: '한국어', ru: 'Русский', ar: 'العربية', pt: 'Português',
  it: 'Italiano', nl: 'Nederlands', tl: 'Filipino', hi: 'हिन्दी', bn: 'বাংলা',
  id: 'Bahasa Indonesia', vi: 'Tiếng Việt', th: 'ไทย', sv: 'Svenska', pl: 'Polski',
  tr: 'Türkçe', uk: 'Українська', el: 'Ελληνικά', he: 'עברית', ur: 'اردو',
  fa: 'فارسی', ms: 'Bahasa Melayu', ro: 'Română', cs: 'Čeština', hu: 'Magyar',
  fi: 'Suomi', no: 'Norsk', da: 'Dansk', bg: 'Български', hr: 'Hrvatski',
  sr: 'Српски', sk: 'Slovenčina', sl: 'Slovenščina', et: 'Eesti', lv: 'Latviešu',
  lt: 'Lietuvių', be: 'Беларуская', ka: 'ქართული', hy: 'Հայերեն', az: 'Azərbaycan',
  kk: 'Қазақша', ky: 'Кыргызча', uz: "O'zbek", tg: 'Тоҷикӣ', mn: 'Монгол',
  km: 'ខ្មែរ', lo: 'ລາວ', my: 'မြန်မာ'
}

const RTL_LANGUAGES: Language[] = ['ar', 'he', 'fa', 'ur']
const LANGUAGE_STORAGE_KEY = 'sss_language'
const EXPLICIT_LANGUAGE_STORAGE_KEY = 'sss_language_explicit'

export function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LANGUAGE_NAMES, value)
}

function detectBrowserLanguage(): Language {
  const languages = Array.isArray(navigator.languages)
    ? navigator.languages
    : [navigator.language]

  for (const value of languages) {
    const code = (value || '').toLowerCase().split('-')[0]
    if (isSupportedLanguage(code)) return code
  }

  return 'en'
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let cancelled = false

    const initializeLanguage = async () => {
      // Explicit local choice wins.
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      const hasExplicitLocalChoice =
        localStorage.getItem(EXPLICIT_LANGUAGE_STORAGE_KEY) === 'true'

      if (hasExplicitLocalChoice && isSupportedLanguage(saved)) {
        setLanguageState(saved)
        setInitialized(true)
        return
      }

      // A signed-in subscriber's saved preference is next.
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const metadataLanguage = user?.user_metadata?.preferred_language
        let profileLanguage: unknown = null

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .or(`user_id.eq.${user.id},id.eq.${user.id}`)
            .maybeSingle()
          profileLanguage = profile?.preferred_language
        }

        const preferredLanguage = isSupportedLanguage(profileLanguage)
          ? profileLanguage
          : metadataLanguage

        if (isSupportedLanguage(preferredLanguage)) {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, preferredLanguage)
          localStorage.setItem(EXPLICIT_LANGUAGE_STORAGE_KEY, 'true')
          if (!cancelled) {
            setLanguageState(preferredLanguage)
            setInitialized(true)
          }
          return
        }
      } catch {}

      // First visit: automatically use the browser/device language.
      const detected = detectBrowserLanguage()
      localStorage.setItem(LANGUAGE_STORAGE_KEY, detected)
      localStorage.removeItem(EXPLICIT_LANGUAGE_STORAGE_KEY)

      if (!cancelled) {
        setLanguageState(detected)
        setInitialized(true)
      }
    }

    initializeLanguage()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!initialized) return
    document.documentElement.lang = language
    document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'
  }, [language, initialized])

  const setLanguage = (newLanguage: Language) => {
    if (!isSupportedLanguage(newLanguage)) return

    setLanguageState(newLanguage)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
    localStorage.setItem(EXPLICIT_LANGUAGE_STORAGE_KEY, 'true')

    // Persist the subscriber preference in Supabase Auth metadata.
    void (async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.auth.updateUser({
          data: { preferred_language: newLanguage }
        })

        await supabase
          .from('profiles')
          .update({ preferred_language: newLanguage })
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      } catch {}
    })()
  }

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      languageName: LANGUAGE_NAMES[language]
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
