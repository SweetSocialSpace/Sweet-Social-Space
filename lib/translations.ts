'use client'

import { useLanguage } from './language-context'
import { useMemo } from 'react'

type Translations = { /*... same as yours... */ }

const translations: Record<string, Translations> = {
  en: require('../translations/en.json'),
  es: require('../translations/es.json'),
  fr: require('../translations/fr.json'),
  //... rest
  my: require('../translations/my.json')
}

export function useTranslations() {
  const { language } = useLanguage()
  return useMemo(() => {
    return translations[language] || translations.en
  }, [language])
}

/**
 * Fixed: walk both trees in parallel so we don't lose keys to collisions.
 * Returns Map: English phrase -> Translated phrase
 */
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
        // Only add if translated and not identical to prevent English leaking
        if (trVal && trVal!== enVal) {
          result[enVal] = trVal
        } else {
          // still map English -> English so lookup doesn't fail
          result[enVal] = trVal || enVal
        }
      } else if (typeof enVal === 'object' && typeof trVal === 'object') {
        walk(enVal, trVal)
      }
    }
  }

  walk(english, selected)
  return result
}
