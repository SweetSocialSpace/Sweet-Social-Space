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

// FIX: Partial so build passes even with 10 translations
export const TRANSLATIONS: Record<string, Partial<Record<Language, string>>> = {
  'Any zip on earth. Chronological. No algorithm.': { es: 'Cualquier código postal del mundo. Cronológico. Sin algoritmo.', fr: 'N’importe quel code postal sur terre. Chronologique. Sans algorithme.' },
  'No posts yet for': { es: 'Aún no hay publicaciones para', fr: 'Pas encore de publications pour', de: 'Noch keine Beiträge für' },
  'Be first. Own your block.': { es: 'Sé el primero. Sé dueño de tu cuadra.', fr: 'Soyez le premier. Possédez votre quartier.' },
  'Post in': { es: 'Publicar en', fr: 'Publier dans' },
  'Enter': { es: 'Entrar a', fr: 'Entrer dans' },
  'Feed': { es: 'Muro', fr: 'Fil' },
  'Change Zip': { es: 'Cambiar Código', fr: 'Changer Code Postal' },
  'Block:': { es: 'Cuadra:', fr: 'Quartier:' },
  'Your Neighborhood': { es: 'Tu Vecindario', fr: 'Votre Quartier' },
  'Trending': { es: 'Tendencia', fr: 'Tendance' },
  'Marketplace': { es: 'Mercado', fr: 'Marché' },
  'Events': { es: 'Eventos', fr: 'Événements' },
  'Businesses': { es: 'Negocios', fr: 'Commerces' },
  'Faith': { es: 'Fe', fr: 'Foi' },
  'Support': { es: 'Apoyo', fr: 'Soutien' },
  'Login': { es: 'Iniciar Sesión', fr: 'Connexion' },
  'Sign up': { es: 'Registrarse', fr: "S'inscrire" },
  'Chronological': { es: 'Cronológico', fr: 'Chronologique' },
}

export function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LANGUAGE_NAMES, value)
}

function detectBrowserLanguage(): Language {
  const languages = Array.isArray(navigator.languages)? navigator.languages : [navigator.language]
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
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  languageName: 'English',
  t: (k) => k
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let cancelled = false
    const initializeLanguage = async () => {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      const hasExplicitLocalChoice = localStorage.getItem(EXPLICIT_LANGUAGE_STORAGE_KEY) === 'true'
      if (hasExplicitLocalChoice && isSupportedLanguage(saved)) {
        setLanguageState(saved)
        setInitialized(true)
        return
      }
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const metadataLanguage = user?.user_metadata?.preferred_language
        let profileLanguage: unknown = null
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('preferred_language').or(`user_id.eq.${user.id},id.eq.${user.id}`).maybeSingle()
          profileLanguage = profile?.preferred_language
        }
        const preferredLanguage = isSupportedLanguage(profileLanguage)? profileLanguage : metadataLanguage
        if (isSupportedLanguage(preferredLanguage)) {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, preferredLanguage)
          localStorage.setItem(EXPLICIT_LANGUAGE_STORAGE_KEY, 'true')
          if (!cancelled) { setLanguageState(preferredLanguage); setInitialized(true) }
          return
        }
      } catch {}
      const detected = detectBrowserLanguage()
      localStorage.setItem(LANGUAGE_STORAGE_KEY, detected)
      localStorage.removeItem(EXPLICIT_LANGUAGE_STORAGE_KEY)
      if (!cancelled) { setLanguageState(detected); setInitialized(true) }
    }
    initializeLanguage()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!initialized) return
    document.documentElement.lang = language
    document.documentElement.dir = RTL_LANGUAGES.includes(language)? 'rtl' : 'ltr'
  }, [language, initialized])

  const setLanguage = (newLanguage: Language) => {
    if (!isSupportedLanguage(newLanguage)) return
    setLanguageState(newLanguage)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
    localStorage.setItem(EXPLICIT_LANGUAGE_STORAGE_KEY, 'true')
    void (async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.auth.updateUser({ data: { preferred_language: newLanguage } })
        await supabase.from('profiles').update({ preferred_language: newLanguage }).or(`user_id.eq.${user.id},id.eq.${user.id}`)
      } catch {}
    })()
  }

  const t = (key: string): string => {
    const trimmed = key.trim()
    if (!trimmed) return key
    if (TRANSLATIONS[trimmed]?.[language]) return TRANSLATIONS[trimmed]![language]!
    for (const dictKey of Object.keys(TRANSLATIONS)) {
      if (trimmed.startsWith(dictKey)) {
        const trans = TRANSLATIONS[dictKey][language] || dictKey
        return trimmed.replace(dictKey, trans)
      }
    }
    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageName: LANGUAGE_NAMES[language], t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
