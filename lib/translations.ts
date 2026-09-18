'use client'
import { useLanguage } from './language-context'

const translations: Record<string, any> = {}
const languageCodes = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'tl', 'hi', 'ar', 'pt', 'ru', 'it', 'nl', 'sv', 'pl', 'uk', 'el', 'tr', 'cs', 'hu', 'fi', 'no', 'da', 'bg', 'hr', 'sr', 'sk', 'sl', 'et', 'lv', 'lt', 'be', 'ro', 'he', 'ur', 'fa', 'id', 'vi', 'th', 'ms', 'km', 'lo', 'my', 'bn', 'ka', 'hy', 'az', 'kk', 'ky', 'uz', 'tg', 'mn']

languageCodes.forEach(code => {
  try {
    translations[code] = require(`../public/translations/${code}.json`)
  } catch {
    try {
      translations[code] = require(`../translations/${code}.json`)
    } catch {
      translations[code] = {}
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
  const code = (language || 'en').toLowerCase().split('-')[0]
  const english = translations['en'] || {}
  const selected = translations[code] || {}
  if (Object.keys(selected).length === 0 && code!== 'en') {
    return english
  }
  return deepMerge(selected, english)
}

export function tFormat(str: string | undefined, vars: Record<string,string|number>): string {
  if (!str) return ''
  let s = str
  try {
    for (const [k,v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  } catch {}
  return s
}

export default useTranslations
