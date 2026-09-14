'use client'
import { useEffect, useRef } from 'react'
import { useLanguage, TRANSLATIONS } from '@/lib/language-context'

export default function GlobalLanguageTranslator() {
  const { language } = useLanguage()
  const originalTexts = useRef<Map<Text, string>>(new Map())

  useEffect(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node: Text | null

    while ((node = walker.nextNode() as Text | null)) {
      if (node.parentElement?.tagName === 'SCRIPT' || node.parentElement?.tagName === 'STYLE' || node.parentElement?.tagName === 'NOSCRIPT') continue
      const txt = node.textContent?.trim()
      if (!txt || txt.length < 2) continue
      if (!originalTexts.current.has(node)) {
        originalTexts.current.set(node, node.textContent || '')
      }
    }

    originalTexts.current.forEach((original, textNode) => {
      if (language === 'en') {
        textNode.textContent = original
        return
      }
      for (const key of Object.keys(TRANSLATIONS)) {
        if (original.trim() === key || original.trim().startsWith(key)) {
          const translated = (TRANSLATIONS as any)[key]?.[language]
          if (translated) {
            textNode.textContent = original.replace(key, translated)
            break
          }
        }
      }
    })
  }, [language])

  return null
}
