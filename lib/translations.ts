'use client'
import { useLanguage } from './language-context'
import { useMemo } from 'react'

type Dict = Record<string, any>

// ONLY static imports — Next.js can bundle these. Must exist at /translations/en.json and /translations/es.json
import en from '@/translations/en.json'
import es from '@/translations/es.json'

// Add more as you create them — static so build never fails
// import fr from '@/translations/fr.json'

const translations: Record<string, Dict> = {
  en,
  es,
  // fr,
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
    if (!language || language === 'en') return english
    const code = language.toLowerCase().split('-')[0] // es-MX -> es
    const selected = translations[code] || translations[language]
    if (!selected || Object.keys(selected).length === 0) {
      return english
    }
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
