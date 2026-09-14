'use client'
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language-context'

const CACHE_KEY = 'sss_ui_translations_v2'

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
  const originals = useRef<Map<Node, string>>(new Map())

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (language === 'en') {
      originals.current.forEach((orig, node) => {
        if (node.textContent!== orig) node.textContent = orig
      })
      originals.current.clear()
      return
    }

    let stopped = false
    const cache = getCache()[language] || {}

    const shouldSkip = (parent: Element) => {
      const tag = parent.tagName
      if (['SCRIPT','STYLE','NOSCRIPT','CODE'].includes(tag)) return true
      if (parent.closest('[data-no-translate]')) return true
      if (parent.closest('textarea')) return true
      return false
    }

    const translateTextNode = async (node: Node) => {
      const parent = node.parentElement
      if (!parent) return
      if (shouldSkip(parent)) return

      const raw = node.textContent || ''
      const trimmed = raw.trim()
      if (trimmed.length < 2) return
      if (trimmed.length > 100) return
      if (/^[\d\W]+$/.test(trimmed)) return
      if (/^[0-9]/.test(trimmed) && trimmed.includes('mi')) return // skip "5 mi"

      // already translated?
      if (originals.current.has(node)) return

      // use cache first
      if (cache[trimmed]) {
        originals.current.set(node, raw)
        node.textContent = raw.replace(trimmed, cache[trimmed])
        return
      }

      // Don't translate user posts - they have their own translator
      if (parent.closest('[data-post-body]')) return

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmed, targetLang: language })
        })
        const json = await res.json()
        if (!stopped && json.translated && json.translated!== trimmed && json.translated.toLowerCase()!== trimmed.toLowerCase()) {
          originals.current.set(node, raw)
          node.textContent = raw.replace(trimmed, json.translated)
          setCache(language, trimmed, json.translated)
        }
      } catch {}
    }

    const scanAll = async () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const nodes: Node[] = []
      let n: Node | null
      while ((n = walker.nextNode())) nodes.push(n)

      // Translate 5 at a time to not hit rate limit
      for (let i = 0; i < nodes.length; i += 5) {
        if (stopped) break
        await Promise.all(nodes.slice(i, i + 5).map(translateTextNode))
        await new Promise(r => setTimeout(r, 200)) // 200ms pause
      }
    }

    const timeout = setTimeout(scanAll, 800)
    const observer = new MutationObserver(() => {
      setTimeout(scanAll, 500)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      stopped = true
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [language])

  return null
}
