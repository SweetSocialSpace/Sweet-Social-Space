'use client'
import { useLanguage } from './language-context'
import { useEffect, useState } from 'react'

const cache: Record<string, any> = {}

export function useTranslations() {
  const { language } = useLanguage()
  const code = (language || 'en').toLowerCase().split('-')[0]

  const [translations, setTranslations] = useState(() => {
    return cache[code] || {}
  })

  useEffect(() => {
    let isMounted = true
    async function load() {
      if (cache[code]) {
        if (isMounted) setTranslations(cache[code])
        return
      }
      try {
        const res = await fetch(`/translations/${code}.json`)
        if (res.ok) {
          const data = await res.json()
          cache[code] = data
          if (isMounted) setTranslations(data)
        }
      } catch (err) {
        console.error(`Failed to load ${code}.json`, err)
      }
    }
    load()
    return () => { isMounted = false }
  }, [code])

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
