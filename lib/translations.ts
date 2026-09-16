'use client'
import { useLanguage } from './language-context'
import { useMemo } from 'react'

// SYNCHRONOUS LOADING - No fetch, no 404, no flash, instant switch
// All translations bundled at build time - works offline
type Dict = Record<string, any>

// Import English first (required as fallback)
import en from '@/translations/en.json'

// Helper to safely load a language - returns {} if missing
function loadLang(code: string): Dict {
  try {
    // Dynamic require - Next.js will bundle these JSON files
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/translations/${code}.json`)
  } catch {
    try {
      // Fallback: try public folder path
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(`@/public/translations/${code}.json`)
    } catch (e) {
      console.warn(` Failed to load ${code}.json, using fallback`)
      return {}
    }
  }
}

// Load all 56 languages synchronously at startup
// This is bundled into JS - no network requests
const translations: Record<string, Dict> = {
  en,
  es: loadLang('es'),
  fr: loadLang('fr'),
  de: loadLang('de'),
  zh: loadLang('zh'),
  ja: loadLang('ja'),
  ko: loadLang('ko'),
  tl: loadLang('tl'),
  hi: loadLang('hi'),
  ar: loadLang('ar'),
  pt: loadLang('pt'),
  ru: loadLang('ru'),
  it: loadLang('it'),
  nl: loadLang('nl'),
  sv: loadLang('sv'),
  pl: loadLang('pl'),
  uk: loadLang('uk'),
  el: loadLang('el'),
  tr: loadLang('tr'),
  cs: loadLang('cs'),
  hu: loadLang('hu'),
  fi: loadLang('fi'),
  no: loadLang('no'),
  da: loadLang('da'),
  bg: loadLang('bg'),
  hr: loadLang('hr'),
  sr: loadLang('sr'),
  sk: loadLang('sk'),
  sl: loadLang('sl'),
  et: loadLang('et'),
  lv: loadLang('lv'),
  lt: loadLang('lt'),
  be: loadLang('be'),
  ro: loadLang('ro'),
  he: loadLang('he'),
  ur: loadLang('ur'),
  fa: loadLang('fa'),
  id: loadLang('id'),
  vi: loadLang('vi'),
  th: loadLang('th'),
  ms: loadLang('ms'),
  km: loadLang('km'),
  lo: loadLang('lo'),
  my: loadLang('my'),
  bn: loadLang('bn'),
  ka: loadLang('ka'),
  hy: loadLang('hy'),
  az: loadLang('az'),
  kk: loadLang('kk'),
  ky: loadLang('ky'),
  uz: loadLang('uz'),
  tg: loadLang('tg'),
  mn: loadLang('mn'),
}

function deepMerge(target: Dict, fallback: Dict): Dict {
  if (!fallback) return target
  if (!target) return fallback
  const out: Dict = {...fallback }
  for (const k of Object.keys(target)) {
    if (
      typeof target[k] === 'object' &&
      target[k]!== null &&
     !Array.isArray(target[k]) &&
      typeof fallback[k] === 'object' &&
      fallback[k]!== null &&
     !Array.isArray(fallback[k])
    ) {
      out[k] = deepMerge(target[k], fallback[k])
    } else {
      out[k] = target[k]
    }
  }
  return out
}

export function useTranslations() {
  const { language } = useLanguage()

  return useMemo(() => {
    const english = translations['en'] || en
    if (language === 'en') return english

    const selected = translations[language]
    if (!selected || Object.keys(selected).length === 0) {
      console.warn(` No translation found for ${language}, using English`)
      return english
    }

    // Merge selected language over English fallback
    // So if Spanish is missing a key, English shows instead of blank
    return deepMerge(selected, english)
  }, [language])
}

export function tFormat(str: string | undefined, vars: Record<string, string | number>) {
  if (!str) return ''
  let s = str
  try {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  } catch {}
  return s
}

export default useTranslations
