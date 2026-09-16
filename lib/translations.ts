'use client'
import { useEffect, useState, useMemo } from 'react'
import { useLanguage } from './language-context'

type Dict = Record<string, any>
let cache: Dict = {}
let enFallback: Dict | null = null
let loadingPromises: Dict = {}

function deepMergeWithFallback(target: Dict, fallback: Dict): Dict {
  if (!fallback) return target
  if (!target) return fallback
  const out: Dict = { ...fallback, ...target }
  for (const k of Object.keys(fallback)) {
    if (typeof fallback[k] === 'object' && fallback[k] !== null && !Array.isArray(fallback[k])) {
      if (typeof target[k] === 'object' && target[k] !== null) {
        out[k] = deepMergeWithFallback(target[k], fallback[k])
      } else {
        out[k] = fallback[k]
      }
    }
  }
  return out
}

async function safeLoad(lang: string): Promise<Dict | null> {
  if (cache[lang]) return cache[lang]
  if (loadingPromises[lang]) return loadingPromises[lang]
  const p = (async ()=>{
    try {
      // Try multiple paths - no require() to avoid build crash
      const paths = [`/locales/${lang}.json`, `/translations/${lang}.json`, `/${lang}.json`]
      for (const path of paths) {
        try {
          const res = await fetch(path, { cache: 'no-store' })
          if (res.ok) {
            const json = await res.json()
            cache[lang] = json
            return json
          }
        } catch {}
      }
      console.warn(`[i18n] Failed to load ${lang}, will use fallback`)
      return null
    } catch(e){ console.warn(`[i18n] load error ${lang}`, e); return null }
    finally { delete loadingPromises[lang] }
  })()
  loadingPromises[lang] = p
  return p
}

export function useTranslations() {
  const { language } = useLanguage()
  const [dict, setDict] = useState<Dict>(()=> enFallback || {})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(()=>{
    let mounted = true
    const run = async ()=>{
      setIsLoading(true)
      try {
        if (!enFallback) {
          const en = await safeLoad('en')
          if (en) enFallback = en
        }
        if (language === 'en' && enFallback) { if (mounted) setDict(enFallback); return }
        const langData = await safeLoad(language)
        if (!mounted) return
        if (langData && enFallback) setDict(deepMergeWithFallback(langData, enFallback))
        else if (langData) setDict(langData)
        else if (enFallback) setDict(enFallback)
      } finally { if (mounted) setIsLoading(false) }
    }
    run()
    return ()=>{ mounted = false }
  }, [language])

  // memoize to avoid deepMerge on every render (issue #9)
  return useMemo(()=> dict, [dict])
}

export function useTranslation() { return useTranslations() }
export default useTranslations

// Safe helper for {var} replacement (issue #7)
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
