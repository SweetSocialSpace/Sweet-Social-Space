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
}

// Import all translation files
const translations: Record<string, Translations> = {
  en: require('../translations/en.json'),
  es: require('../translations/es.json'),
  fr: require('../translations/fr.json'),
  de: require('../translations/de.json'),
  zh: require('../translations/zh.json'),
  ja: require('../translations/ja.json'),
  ko: require('../translations/ko.json'),
  pt: require('../translations/pt.json'),
  ru: require('../translations/ru.json'),
  ar: require('../translations/ar.json'),
  hi: require('../translations/hi.json'),
  it: require('../translations/it.json'),
  nl: require('../translations/nl.json'),
  tl: require('../translations/tl.json')
}

export function useTranslations() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  return t
}
