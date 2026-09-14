'use client'
import { useEffect, useRef } from 'react'
import { useLanguage, TRANSLATIONS } from '@/lib/language-context'

export default function GlobalTranslator() {
  const { language } = useLanguage()
  const originals = useRef<Map<Text, string>>(new Map())

  useEffect(() => {
    if (language === 'en') {
      originals.current.forEach((orig, node) => {
        if (node.textContent) node.textContent = orig
      })
      return
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node: Text | null
    while (node = walker.nextNode() as Text) {
      const raw = node.textContent?.trim()
      if (!raw || raw.length < 3) continue
      if (node.parentElement?.closest('[data-sss-no-translate]')) continue
      if (!originals.current.has(node)) originals.current.set(node, node.textContent!)

      if (TRANSLATIONS[raw]?.[language]) {
        node.textContent = node.textContent!.replace(raw, TRANSLATIONS[raw][language]!)
      } else {
        // async translate unknown text - your whole platform fix
        const n = node
        const originalText = raw
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: originalText, targetLang: language })
        }).then(r=>r.json()).then(d=>{
          if (d.translated && d.translated!== originalText) {
            n.textContent = n.textContent!.replace(originalText, d.translated)
          }
        })
      }
    }
  }, [language])
  return null
}
