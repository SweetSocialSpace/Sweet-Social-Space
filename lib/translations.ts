'use client'

import { useLanguage } from './language-context'
import { useMemo } from 'react'

type Translations = {
  nav: { feed: string; profile: string; settings: string; signOut: string }
  feed: { whatsHappening: string; postAs: string; in: string; loading: string; postingAs: string; near: string; posts: string; noPosts: string; joinLive: string; wasLive: string; delete: string }
  common: { backToFeed: string; save: string; cancel: string; error: string; loading: string; submit: string; close: string; confirm: string; success: string; failed: string; retry: string }
  weather: { weather: string; live: string; temperature: string; feelsLike: string; humidity: string; wind: string }
  location: { setLocation: string; locating: string; yourArea: string; yourBlock: string; detecting: string; privacyProtected: string; zipCode: string; city: string; country: string }
  filters: { all: string; faith: string; general: string; safety: string; forSale: string; free: string; lostPet: string; event: string; help: string; recommend: string; job: string }
  categories: { general: string; faith: string; safety: string; forSale: string; free: string; lostPet: string; event: string; help: string; recommend: string; job: string }
  auth: { signIn: string; signUp: string; signOut: string; email: string; password: string; confirmPassword: string; forgotPassword: string; resetPassword: string; dontHaveAccount: string; alreadyHaveAccount: string; signingIn: string; signingUp: string; signInError: string; signUpError: string; accountCreated: string; checkEmail: string; takingToFeed: string }
  post: { createPost: string; postTo: string; oneStop: string; tapMic: string; worksIn: string; anyPhoneComputer: string; universalMic: string; price: string; condition: string; address: string; addressPrivate: string; postingAs: string; postButton: string; category: string; selectCategory: string; new: string; likeNew: string; good: string; fair: string; free: string; pricePlaceholder: string; stillDetecting: string; waitSeconds: string; postFailed: string }
  profile: { profile: string; settings: string; deleteAccount: string; editProfile: string; displayName: string; username: string; bio: string; avatar: string; saveChanges: string; deleteAccountConfirm: string; deleteAccountWarning: string; accountDeleted: string }
  settings: { settings: string; account: string; privacy: string; notifications: string; language: string; theme: string; darkMode: string; lightMode: string; autoDetect: string; saveSettings: string; settingsSaved: string }
  errors: { somethingWentWrong: string; tryAgain: string; networkError: string; serverError: string; permissionDenied: string; notFound: string; unauthorized: string; requiredField: string; invalidEmail: string; invalidPassword: string; passwordMismatch: string }
  success: { postCreated: string; postUpdated: string; postDeleted: string; profileUpdated: string; settingsUpdated: string; messageSent: string }
  loading: { loading: string; processing: string; uploading: string; downloading: string; connecting: string; fetching: string; pleaseWait: string }
  buttons: { submit: string; cancel: string; delete: string; edit: string; share: string; like: string; comment: string; report: string; follow: string; unfollow: string; block: string; unblock: string; save: string; discard: string; continue: string; back: string; next: string; previous: string; done: string; skip: string }
  placeholders: { email: string; password: string; search: string; message: string; comment: string; displayName: string; username: string; bio: string; address: string; city: string; zipCode: string; country: string; phone: string; website: string }
  time: { justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string; weeksAgo: string; monthsAgo: string; yearsAgo: string; today: string; yesterday: string; tomorrow: string }
  social: { neighbors: string; community: string; nearby: string; local: string; yourArea: string; worldwide: string; friends: string; followers: string; following: string }
  actions: { post: string; share: string; like: string; comment: string; save: string; report: string; block: string; follow: string; message: string; call: string; visit: string }
  status: { online: string; offline: string; away: string; busy: string; live: string; ended: string; scheduled: string; cancelled: string }
  radius: { radius: string; miles: string; kilometers: string; show: string; within: string }
  trust: { trustScore: string; verified: string; trusted: string; communityTrusted: string; newMember: string; established: string }
  events: { events: string; upcoming: string; past: string; today: string; thisWeek: string; thisMonth: string; createEvent: string; eventDetails: string; attending: string; interested: string; notInterested: string }
  marketplace: { marketplace: string; forSale: string; wanted: string; services: string; housing: string; price: string; condition: string; location: string; seller: string; contact: string; message: string }
  emergency: { emergency: string; alerts: string; warning: string; danger: string; safe: string; allClear: string; reportEmergency: string; callEmergency: string }
  support: { help: string; support: string; contact: string; faq: string; documentation: string; community: string; reportIssue: string; feedback: string }
  legal: { terms: string; privacy: string; cookies: string; disclaimer: string; rights: string; responsibilities: string }
}

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

// Deep merge: ensures if a language is missing a key, English fills it
function deepMerge(en: any, tr: any): any {
  if (!tr) return en
  const result: any = {...en }
  for (const key of Object.keys(en)) {
    if (typeof en[key] === 'object' && typeof tr[key] === 'object') {
      result[key] = deepMerge(en[key], tr[key])
    } else {
      result[key] = tr[key] || en[key]
    }
  }
  return result
}

export function useTranslations() {
  const { language } = useLanguage()
  return useMemo(() => {
    const en = translations.en
    const selected = translations[language] || en
    return deepMerge(en, selected) as Translations
  }, [language])
}

export function getGlobalTranslations(language: string): Record<string, string> {
  const selected = translations[language] || translations.en
  const english = translations.en
  const result: Record<string, string> = {}

  function walk(enNode: any, trNode: any) {
    if (!enNode ||!trNode || typeof enNode!== 'object') return
    for (const key of Object.keys(enNode)) {
      const enVal = enNode[key]
      const trVal = trNode[key]
      if (typeof enVal === 'string' && typeof trVal === 'string') {
        result[enVal] = trVal || enVal
      } else if (typeof enVal === 'object' && typeof trVal === 'object') {
        walk(enVal, trVal)
      }
    }
  }
  walk(english, selected)
  return result
}
