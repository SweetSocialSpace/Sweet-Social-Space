'use client'
import { useLanguage } from './language-context'
import { useEffect, useState } from 'react'

const cache: Record<string, any> = {}

export function useTranslations() {
  const { language } = useLanguage()
  const code = (language || 'en').toLowerCase().split('-')[0]

  const [translations, setTranslations] = useState(() => {
    // Start with English if we have it, so never blank on first render
    return cache[code] || cache['en'] || {}
  })

  useEffect(() => {
    let isMounted = true
    async function load() {
      // 1. Always make sure English is loaded as base
      if (!cache['en']) {
        try {
          const resEn = await fetch(`/translations/en.json`)
          if (resEn.ok) {
            cache['en'] = await resEn.json()
          }
        } catch {}
      }

      // 2. If user wants English, just use it
      if (code === 'en') {
        if (isMounted && cache['en']) setTranslations(cache['en'])
        return
      }

      // 3. If we already have this language cached, merge with English base
      if (cache[code]) {
        if (isMounted) setTranslations({...cache['en'],...cache[code] })
        return
      }

      // 4. Try to load picked language
      try {
        const res = await fetch(`/translations/${code}.json`)
        if (res.ok) {
          const data = await res.json()
          // Don't cache empty files (the broken ones from the script)
          if (data && Object.keys(data).length > 0) {
            cache[code] = data
            if (isMounted) setTranslations({...cache['en'],...data })
          } else {
            // Empty file = treat as missing, use English
            if (isMounted) setTranslations(cache['en'] || {})
          }
        } else {
          // File doesn't exist = use English, don't go blank
          if (isMounted) setTranslations(cache['en'] || {})
        }
      } catch (err) {
        console.error(`Failed to load ${code}.json`, err)
        if (isMounted) setTranslations(cache['en'] || {})
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
