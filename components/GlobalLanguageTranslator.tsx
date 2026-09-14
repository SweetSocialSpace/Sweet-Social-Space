'use client'
import { useEffect, useRef } from 'react'
import { useLanguage, TRANSLATIONS } from '@/lib/language-context'

export default function GlobalLanguageTranslator() {
  const { language } = useLanguage()
  const originalTexts = useRef<Map<Text, string>>(new Map())

  useEffect(() => {
    // Store original English once
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node: Text | null
    const textNodes: Text[] = []

    while ((node = walker.nextNode() as Text | null)) {
      if (node.parentElement?.tagName === 'SCRIPT' || node.parentElement?.tagName === 'STYLE') continue
      const txt = node.textContent?.trim()
      if (!txt || txt.length < 2) continue
      if (!originalTexts.current.has(node)) {
        originalTexts.current.set(node, node.textContent || '')
      }
      textNodes.push(node)
    }

    // Restore originals first, then translate if not English
    originalTexts.current.forEach((original, textNode) => {
      // Restore English
      if (language === 'en') {
        textNode.textContent = original
        return
      }
      // Translate to other language
      for (const key of Object.keys(TRANSLATIONS)) {
        if (original.trim() === key || original.trim().startsWith(key)) {
          const translated = (TRANSLATIONS as any)[key][language]
          if (translated) {
            textNode.textContent = original.replace(key, translated)
            break
          }
        }
      }
    })
  }, [language])
}
