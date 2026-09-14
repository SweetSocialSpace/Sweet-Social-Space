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

// FIXED: Full platform translations - this is what makes the whole screenshot flip
export const TRANSLATIONS: Record<string, Partial<Record<Language, string>>> = {
  // Original
  'Any zip on earth. Chronological. No algorithm.': { es: 'Cualquier código postal del mundo. Cronológico. Sin algoritmo.' },
  'No posts yet for': { es: 'Aún no hay publicaciones para' },
  'Be first. Own your block.': { es: 'Sé el primero. Sé dueño de tu cuadra.' },
  'Post in': { es: 'Publicar en' },
  'Enter': { es: 'Entrar a' },
  'Feed': { es: 'Muro' },
  'Change Zip': { es: 'Cambiar Código' },
  'Block:': { es: 'Cuadra:' },
  'Your Neighborhood': { es: 'Tu Vecindario' },
  'Trending': { es: 'Tendencia' },
  'Marketplace': { es: 'Mercado' },
  'Events': { es: 'Eventos' },
  'Businesses': { es: 'Negocios' },
  'Faith': { es: 'Fe' },
  'Support': { es: 'Apoyo' },
  'Login': { es: 'Iniciar Sesión' },
  'Sign up': { es: 'Registrarse' },
  'Chronological': { es: 'Cronológico' },

  // YOUR SCREENSHOT - This is what was missing
  'Live Pulse': { es: 'Pulso en Vivo' },
  'AI Mayor': { es: 'Alcalde IA' },
  'AI MAYOR': { es: 'ALCALDE IA' },
  'Live Map': { es: 'Mapa en Vivo' },
  'Trust Meter': { es: 'Medidor de Confianza' },
  'Weather': { es: 'Clima' },
  'Pinned Alert': { es: 'Alerta Fijada' },
  'Emergency Alerts': { es: 'Alertas de Emergencia' },
  'Latest Alerts': { es: 'Últimas Alertas' },
  "What's Happening Near You": { es: 'Qué Pasa Cerca de Ti' },
  'Faith of the Day': { es: 'Fe del Día' },
  'Faith Of The Day': { es: 'Fe del Día' },
  'Local Businesses': { es: 'Negocios Locales' },
  'Business Directory': { es: 'Directorio de Negocios' },
  'Marketplace Preview': { es: 'Vista Previa del Mercado' },
  'Create Post': { es: 'Crear Publicación' },
  'Emergency': { es: 'Emergencia' },
  'For Sale': { es: 'En Venta' },
  'Free': { es: 'Gratis' },
  'Safety': { es: 'Seguridad' },
  'General': { es: 'General' },
  'Help': { es: 'Ayuda' },
  'Recommend': { es: 'Recomendar' },
  'Lost Pet': { es: 'Mascota Perdida' },
  'Event': { es: 'Evento' },
  'Job': { es: 'Empleo' },
  'All': { es: 'Todos' },
  'LIVE': { es: 'EN VIVO' },
  'Live': { es: 'En Vivo' },
  'Posting as': { es: 'Publicando como' },
  'Post to': { es: 'Publicar en' },
  'View Map': { es: 'Ver Mapa' },
  'live pins': { es: 'pines en vivo' },
  'Full view': { es: 'Vista completa' },
  'verified': { es: 'verificado' },
  'trusted': { es: 'confiables' },
  'No emergencies': { es: 'Sin emergencias' },
  'clear sky': { es: 'cielo despejado' },
  'online': { es: 'en línea' },
  'See Faith Posts': { es: 'Ver Publicaciones de Fe' },
  'Share': { es: 'Compartir' },
  'Go Live': { es: 'Transmitir en Vivo' },
  'Set location': { es: 'Establecer ubicación' },
  'Near': { es: 'Cerca' },
  'Your private block': { es: 'Tu cuadra privada' },
  'Welcome to your private block': { es: 'Bienvenido a tu cuadra privada' },
  'This is your space near': { es: 'Este es tu espacio cerca de' },
  'Check on a neighbor today': { es: 'Saluda a un vecino hoy' },
  "TODAY'S THOUGHT:": { es: 'PENSAMIENTO DEL DÍA:' },
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
    // partial match for longer strings like "No posts yet for 95122"
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
