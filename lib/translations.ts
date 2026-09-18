'use client'
import { useLanguage } from './language-context'
import { useEffect, useState } from 'react'

const cache: Record<string, any> = {}

function deepMerge(target: any, fallback: any): any {
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

  const [translations, setTranslations] = useState(() => {
    if (cache[code]) return cache[code]
    if (cache['en']) return cache['en']
    return {}
  })

  useEffect(() => {
    let isMounted = true
    async function load() {
      if (!cache['en']) {
        try {
          const res = await fetch(`/translations/en.json`)
          if (res.ok) cache['en'] = await res.json()
        } catch {}
      }
      if (code === 'en') {
        if (isMounted) setTranslations(cache['en'] || {})
        return
      }
      if (cache[code]) {
        if (isMounted) setTranslations(deepMerge(cache[code], cache['en'] || {}))
        return
      }
      try {
        const res = await fetch(`/translations/${code}.json`)
        if (res.ok) {
          const data = await res.json()
          cache[code] = data
          if (isMounted) setTranslations(deepMerge(data, cache['en'] || {}))
        } else {
          if (isMounted) setTranslations(cache['en'] || {})
        }
      } catch {
        if (isMounted) setTranslations(cache['en'] || {})
      }
    }
    load()
    return () => { isMounted = false }
  }, [code])

  if (Object.keys(translations).length === 0) {
    return cache['en'] || cache[code] || {}
  }
  return translations
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
