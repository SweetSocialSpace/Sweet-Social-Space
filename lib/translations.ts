'use client'
import { useLanguage } from './language-context'
import { useMemo } from 'react'

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
  tl: require('../translations/tl.json'),
  bn: require('../translations/bn.json'),
  id: require('../translations/id.json'),
  vi: require('../translations/vi.json'),
  th: require('../translations/th.json'),
  sv: require('../translations/sv.json'),
  pl: require('../translations/pl.json'),
  tr: require('../translations/tr.json'),
  uk: require('../translations/uk.json'),
  el: require('../translations/el.json'),
  he: require('../translations/he.json'),
  ur: require('../translations/ur.json'),
  fa: require('../translations/fa.json'),
  ms: require('../translations/ms.json'),
  ro: require('../translations/ro.json'),
  cs: require('../translations/cs.json'),
  hu: require('../translations/hu.json'),
  fi: require('../translations/fi.json'),
  no: require('../translations/no.json'),
  da: require('../translations/da.json'),
  bg: require('../translations/bg.json'),
  hr: require('../translations/hr.json'),
  sr: require('../translations/sr.json'),
  sk: require('../translations/sk.json'),
  sl: require('../translations/sl.json'),
  et: require('../translations/et.json'),
  lv: require('../translations/lv.json'),
  lt: require('../translations/lt.json'),
  be: require('../translations/be.json'),
  ka: require('../translations/ka.json'),
  hy: require('../translations/hy.json'),
  az: require('../translations/az.json'),
  kk: require('../translations/kk.json'),
  ky: require('../translations/ky.json'),
  uz: require('../translations/uz.json'),
  tg: require('../translations/tg.json'),
  mn: require('../translations/mn.json'),
  km: require('../translations/km.json'),
  lo: require('../translations/lo.json'),
  my: require('../translations/my.json')
}

export function useTranslations() {
  const { language } = useLanguage()
  const t = useMemo(() => {
    return translations[language] || translations.en
  }, [language])
  return t
}
  export function translate(path: string, lang: string) {
  const dictionary = translations[lang] || translations.en;

  return path.split(".").reduce((obj: any, key) => {
    return obj?.[key];
  }, dictionary);
}

