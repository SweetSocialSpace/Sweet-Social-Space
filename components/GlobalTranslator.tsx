'use client'
import { useEffect, useRef } from 'react'
import { useLanguage } from './language-context'
import { getGlobalTranslations } from '../translations'

export default function GlobalTranslator() {
  const { language } = useLanguage()
  const originals = useRef<Map<Text, string>>(new Map())

  useEffect(() => {
    if (typeof document === 'undefined') return

    if (language === 'en') {
      originals.current.forEach((orig, node) => { node.textContent = orig })
      originals.current.clear()
      return
    }

    const dict = getGlobalTranslations(language)

    const translate = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node: Text | null
      while (node = walker.nextNode() as Text) {
        const parent = node.parentElement
        if (!parent) continue
        if (['SCRIPT','STYLE'].includes(parent.tagName)) continue
        if (parent.closest('[data-no-translate]')) continue

        const trimmed = node.textContent?.trim()
        if (!trimmed) continue
        if (dict[trimmed]) {
          if (!originals.current.has(node)) originals.current.set(node, node.textContent!)
          node.textContent = node.textContent!.replace(trimmed, dict[trimmed])
        }
      }
    }

    translate()
    const obs = new MutationObserver(() => translate())
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [language])

  return null
}
