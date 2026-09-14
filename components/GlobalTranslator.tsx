'use client'
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language-context'

export default function GlobalTranslator() {
  const { language } = useLanguage()
  const originals = useRef<Map<Text, string>>(new Map())

  useEffect(() => {
    // 1. When switching BACK to English - restore everything
    if (language === 'en') {
      originals.current.forEach((orig, node) => {
        if (node.parentElement) node.textContent = orig
      })
      return
    }

    // 2. Spanish mode - save original first time only
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node: Text | null
    while (node = walker.nextNode() as Text) {
      const raw = node.textContent?.trim()
      if (!raw || raw.length < 3) continue
      if (node.parentElement?.closest('[data-sss-no-translate]')) continue
      if (!originals.current.has(node)) {
        originals.current.set(node, node.textContent!)
      }
      // Don't translate if already translated
      if (node.textContent?.includes('Fe de Hoy') && language==='en') continue
    }
  }, [language])

  return null
}
