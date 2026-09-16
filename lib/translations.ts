'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useLanguage } from './language-context'

type Dict = Record<string, any>

// LRU Cache with size limit to prevent memory leak
const MAX_CACHE_SIZE = 10
let cache: Map<string, Dict> = new Map()
let enFallback: Dict | null = null

const PATHS = [
  (l: string) => `/translations/${l}.json`,
  (l: string) => `/locales/${l}.json`,
  (l: string) => `/${l}.json`
]

function deepMerge(target: Dict, fallback: Dict): Dict {
  if (!fallback) return target
  if (!target) return fallback
  
  const out: Dict = { ...fallback }
  
  for (const k of Object.keys(target)) {
    if (
      typeof target[k] === 'object' && 
      target[k] !== null && 
      !Array.isArray(target[k]) &&
      typeof fallback[k] === 'object' &&
      fallback[k] !== null &&
      !Array.isArray(fallback[k])
    ) {
      out[k] = deepMerge(target[k], fallback[k])
    } else {
      out[k] = target[k]
    }
  }
  return out
}

function setCache(lang: string, data: Dict) {
  // LRU eviction - remove oldest if over limit
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(lang)) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(lang, data)
}

async function safeLoad(lang: string): Promise<Dict | null> {
  if (cache.has(lang)) {
    return cache.get(lang)!
  }
  
  for (const getPath of PATHS) {
    try {
      const res = await fetch(getPath(lang), { cache: 'no-store' }).catch(() => null)
      if (res && res.ok) {
        const j = await res.json()
        setCache(lang, j)
        return j
      }
    } catch {}
  }
  return null
}

export function useTranslations() {
  const { language } = useLanguage()
  const [dict, setDict] = useState<Dict>(() => {
    // Return cached if available to prevent flash
    if (cache.has(language)) return cache.get(language)!
    if (language === 'en' && enFallback) return enFallback
    return enFallback || {}
  })
  
  const mountedRef = useRef(true)
  const loadingRef = useRef<string | null>(null)

  useEffect(() => {
    mountedRef.current = true
    
    // Prevent duplicate loads for same language
    if (loadingRef.current === language) return
    loadingRef.current = language

    let cancelled = false

    ;(async () => {
      try {
        // Load English fallback first if not loaded
        if (!enFallback) {
          const en = await safeLoad('en')
          if (en && !cancelled) {
            enFallback = en
            if (language === 'en' && mountedRef.current) {
              setDict(en)
              loadingRef.current = null
              return
            }
          }
        }

        if (language === 'en') {
          if (enFallback && mountedRef.current && !cancelled) {
            setDict(enFallback)
          }
          loadingRef.current = null
          return
        }

        // If we have it cached, use it immediately - no flash
        if (cache.has(language) && enFallback) {
          if (mountedRef.current && !cancelled) {
            setDict(deepMerge(cache.get(language)!, enFallback))
          }
          loadingRef.current = null
          return
        }

        // Load requested language
        const d = await safeLoad(language)
        if (cancelled || !mountedRef.current) return

        if (d && enFallback) {
          setDict(deepMerge(d, enFallback))
        } else if (d) {
          setDict(d)
        } else if (enFallback) {
          setDict(enFallback)
        }
      } finally {
        if (!cancelled) {
          loadingRef.current = null
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [language])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return useMemo(() => dict, [dict])
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
