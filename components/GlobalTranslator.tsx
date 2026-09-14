'use client'
import { useEffect, useRef } from 'react'
import { useLanguage, TRANSLATIONS } from '@/lib/language-context'

export default function GlobalTranslator() {
  const { language } = useLanguage()
  const originals = useRef<Map<Text, string>>(new Map())

  useEffect(() => {
    if (language === 'en') {
      originals.current.forEach((orig, node) => node.textContent = orig)
      originals.current.clear()
      return
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node: Text | null
    while (node = walker.nextNode() as Text) {
      const text = node.textContent?.trim()
      if (!text) continue
      if (TRANSLATIONS[text]?.[language]) {
        if (!originals.current.has(node)) originals.current.set(node, node.textContent!)
        node.textContent = node.textContent!.replace(text, TRANSLATIONS[text][language]!)
      }
    }
  }, [language])

  return null
}
