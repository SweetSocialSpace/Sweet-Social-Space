'use client'
import { useEffect } from 'react'
import { useLanguage, TRANSLATIONS } from '@/lib/language-context'

function translateNode(node: Text, lang: string) {
  const original = node.textContent?.trim()
  if (!original || original.length < 2) return
  // Don't translate zip codes, numbers, emails
  if (/^\d+$/.test(original) || original.includes('@')) return

  for (const key of Object.keys(TRANSLATIONS)) {
    if (original === key || original.startsWith(key)) {
      const translated = TRANSLATIONS[key][lang as keyof typeof TRANSLATIONS[typeof key]]
      if (translated && translated!== original) {
        node.textContent = node.textContent!.replace(key, translated)
        return
      }
    }
  }
}

export default function GlobalLanguageTranslator() {
  const { language } = useLanguage()

  useEffect(() => {
    if (language === 'en') {
      // If they switch back to English, reload to restore originals
      // (or you could store originals, but reload is simplest for now)
      if (document.documentElement.getAttribute('data-last-lang')!== 'en') {
        window.location.reload()
      }
      return
    }

    const translateAll = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node: Text | null
      while ((node = walker.nextNode() as Text | null)) {
        if (node.parentElement?.tagName === 'SCRIPT' || node.parentElement?.tagName === 'STYLE' || node.parentElement?.tagName === 'NOSCRIPT') continue
        translateNode(node, language)
      }
    }

    translateAll()
    document.documentElement.setAttribute('data-last-lang', language)

    // Watch for new posts/feed that load after click
    const observer = new MutationObserver(() => translateAll())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [language])

  return null
}
