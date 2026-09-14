'use client'
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language-context'
import { getGlobalTranslations } from '@/lib/translations'

const CACHE_KEY = 'sss_ui_translations'

function getCache(): Record<string, Record<string, string>> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}
function setCache(lang: string, original: string, translated: string) {
  const cache = getCache()
  if (!cache[lang]) cache[lang] = {}
  cache[lang][original] = translated
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

export default function GlobalTranslator() {
  const { language } = useLanguage()
  const originalMap = useRef<Map<Element, string>>(new Map())

  useEffect(() => {
    if (typeof document === 'undefined') return

    const restoreEnglish = () => {
      originalMap.current.forEach((original, el) => {
        if (el.textContent) el.textContent = original
      })
      originalMap.current.clear()
    }

    if (language === 'en') {
      restoreEnglish()
      return
    }

    const dict = getGlobalTranslations(language) // your es.json -> { "All": "Todos", "Weather": "Clima" }
    const cache = getCache()[language] || {}

    const translateNode = async (el: Element, text: string) => {
      const trimmed = text.trim()
      if (trimmed.length < 2 || trimmed.length > 80) return
      if (/^\d+$/.test(trimmed)) return
      if (el.closest('[data-no-translate]')) return

      // 1. Use your es.json if we have it
      if (dict[trimmed]) {
        if (!originalMap.current.has(el)) originalMap.current.set(el, text)
        el.textContent = el.textContent!.replace(trimmed, dict[trimmed])
        return
      }

      // 2. Use cache
      if (cache[trimmed]) {
        if (!originalMap.current.has(el)) originalMap.current.set(el, text)
        el.textContent = el.textContent!.replace(trimmed, cache[trimmed])
        return
      }

      // 3. Call your MyMemory API for anything not in es.json
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmed, targetLang: language })
        })
        const json = await res.json()
        if (json.translated && json.translated!== trimmed) {
          if (!originalMap.current.has(el)) originalMap.current.set(el, text)
          el.textContent = el.textContent!.replace(trimmed, json.translated)
          setCache(language, trimmed, json.translated)
        }
      } catch {}
    }

    const scan = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node: Node | null
      const toTranslate: { el: Element, text: string }[] = []

      while ((node = walker.nextNode())) {
        const parent = node.parentElement
        if (!parent) continue
        if (['SCRIPT','STYLE','NOSCRIPT'].includes(parent.tagName)) continue
        if (parent.closest('textarea,input')) continue
        const text = node.textContent || ''
        if (text.trim().length < 2) continue
        toTranslate.push({ el: parent, text })
      }

      // Translate in small batches so we don't spam MyMemory
      toTranslate.slice(0, 50).forEach(({ el, text }) => translateNode(el, text))
    }

    // Run now + watch for new content (posts, popups)
    const timeout = setTimeout(scan, 500)
    const observer = new MutationObserver(() => scan())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [language])

  return null
}
