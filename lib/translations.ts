'use client'
import { useLanguage } from './language-context'

const translations: Record<string, any> = {}
const languageCodes = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'tl', 'hi', 'ar', 'pt', 'ru', 'it', 'nl', 'sv', 'pl', 'uk', 'el', 'tr', 'cs', 'hu', 'fi', 'no', 'da', 'bg', 'hr', 'sr', 'sk', 'sl', 'et', 'lv', 'lt', 'be', 'ro', 'he', 'ur', 'fa', 'id', 'vi', 'th', 'ms', 'km', 'lo', 'my', 'bn', 'ka', 'hy', 'az', 'kk', 'ky', 'uz', 'tg', 'mn']

// Load from BOTH places — your scan said you have translations/ at root AND public/translations/
languageCodes.forEach(code => {
  try {
    translations[code] = require(`../translations/${code}.json`)
  } catch {
    try {
      translations[code] = require(`../../translations/${code}.json`)
    } catch {
      try {
        translations[code] = require(`./translations/${code}.json`)
      } catch (e) {
        // Don't spam console — just set empty so merge doesn't crash
        translations[code] = {}
      }
    }
  }
})

function deepMerge(target: any, fallback: any) {
  const out: any = {...fallback }
  for (const key in target) {
    if (target[key] && typeof target[key] === 'object' &&!Array.isArray(target[key])) {
      out[key] = deepMerge(target[key] || {}, fallback[key] || {})
    } else {
      out[key] = target[key]
    }
  }
  return out
}

export function useTranslations() {
  const { language } = useLanguage()
  // FIX 2: fr-CA -> fr, es-MX -> es — works for all 52
  const code = (language || 'en').toLowerCase().split('-')[0]
  const english = translations['en'] || {}
  const selected = translations[code] || {}

  // If we have that language file, merge it with English so missing keys don't crash
  // If we DON'T have it, return {} so you see it's missing, not silent English
  if (Object.keys(selected).length === 0 && code!== 'en') {
    console.warn(`Missing translation file for: ${code} — add translations/${code}.json`)
    return english // temporary so platform doesn't crash — replace with {} once you add the file
  }

  return deepMerge(selected, english)
}

export function tFormat(str: string | undefined, vars: Record<string,string|number>): string {
  if (!str) return ''
  let s = str
  try {
    for (const [k][v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  } catch {}
  return s
}

export default useTranslations
