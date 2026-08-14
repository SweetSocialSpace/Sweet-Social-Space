'use client'
import { useLanguage } from './language-context'

type Translations = {
  nav: {
    feed: string
    profile: string
    settings: string
    signOut: string
  }
  feed: {
    whatsHappening: string
    postAs: string
    in: string
    loading: string
  }
  common: {
    backToFeed: string
    save: string
    cancel: string
    error: string
    loading: string
  }
  weather: {
    weather: string
    live: string
  }
  location: {
    setLocation: string
    locating: string
  }
  filters: {
    all: string
    faith: string
    general: string
    safety: string
    forSale: string
    free: string
    lostPet: string
    event: string
    help: string
    recommend: string
  }
}

// Import all translation files dynamically
const translations: Record<string, Translations> = {
  en: {} as Translations,
  es: {} as Translations,
  fr: {} as Translations,
  de: {} as Translations,
  zh: {} as Translations,
  ja: {} as Translations,
  ko: {} as Translations,
  pt: {} as Translations,
  ru: {} as Translations,
  ar: {} as Translations,
  hi: {} as Translations,
  it: {} as Translations,
  nl: {} as Translations,
  tl: {} as Translations,
  bn: {} as Translations,
  id: {} as Translations,
  vi: {} as Translations,
  th: {} as Translations,
  sv: {} as Translations,
  pl: {} as Translations,
  tr: {} as Translations,
  uk: {} as Translations,
  el: {} as Translations,
  he: {} as Translations,
  ur: {} as Translations,
  fa: {} as Translations,
  ms: {} as Translations,
  ro: {} as Translations,
  cs: {} as Translations,
  hu: {} as Translations,
  fi: {} as Translations,
  no: {} as Translations,
  da: {} as Translations,
  bg: {} as Translations,
  hr: {} as Translations,
  sr: {} as Translations,
  sk: {} as Translations,
  sl: {} as Translations,
  et: {} as Translations,
  lv: {} as Translations,
  lt: {} as Translations,
  be: {} as Translations,
  ka: {} as Translations,
  hy: {} as Translations,
  az: {} as Translations,
  kk: {} as Translations,
  ky: {} as Translations,
  uz: {} as Translations,
  tg: {} as Translations,
  mn: {} as Translations,
  km: {} as Translations,
  lo: {} as Translations,
  my: {} as Translations
}

// Load translations dynamically on client side
if (typeof window !== 'undefined') {
  const loadTranslations = async () => {
    const langFiles = [
      'en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'ru', 'ar', 'hi', 'it', 'nl', 'tl',
      'bn', 'id', 'vi', 'th', 'sv', 'pl', 'tr', 'uk', 'el', 'he', 'ur', 'fa', 'ms', 'ro',
      'cs', 'hu', 'fi', 'no', 'da', 'bg', 'hr', 'sr', 'sk', 'sl', 'et', 'lv', 'lt', 'be',
      'ka', 'hy', 'az', 'kk', 'ky', 'uz', 'tg', 'mn', 'km', 'lo', 'my'
    ]
    
    for (const lang of langFiles) {
      try {
        const response = await fetch(`/translations/${lang}.json`)
        if (response.ok) {
          translations[lang] = await response.json()
        }
      } catch (error) {
        console.error(`Failed to load translation for ${lang}:`, error)
      }
    }
  }
  
  loadTranslations()
}

export function useTranslations() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  return t
}
