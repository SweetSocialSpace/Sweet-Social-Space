'use client'

import { useEffect } from 'react'
import { getGlobalTranslations } from '@/lib/translations'
import { useLanguage } from '@/lib/language-context'

/**
 * Text that belongs to the application itself can be translated.
 *
 * User-generated content is deliberately excluded from this process.
 */
const EXCLUDED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'TEXTAREA',
  'INPUT',
  'OPTION'
])

function shouldTranslate(node: Text): boolean {
  const parent = node.parentElement

  if (!parent) return false

  if (EXCLUDED_TAGS.has(parent.tagName)) {
    return false
  }

  if (
    parent.closest('[data-user-content="true"]') ||
    parent.closest('[contenteditable="true"]')
  ) {
    return false
  }

  const text = node.nodeValue?.trim()

  if (!text) return false

  /*
   * Ignore very long text. Long strings are much more likely
   * to be user-generated content rather than an interface label.
   */
  if (text.length > 160) return false

  return true
}

function translateTextNodes(
  root: Node,
  dictionary: Record<string, string>
) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT
  )

  const nodes: Text[] = []

  let current = walker.nextNode()

  while (current) {
    if (current instanceof Text && shouldTranslate(current)) {
      nodes.push(current)
    }

    current = walker.nextNode()
  }

  nodes.forEach((node) => {
    const original = node.nodeValue?.trim()

    if (!original) return

    const translated = dictionary[original]

    if (!translated || translated === original) {
      return
    }

    /*
     * Preserve whitespace around the original text.
     */
    const leadingWhitespace =
      node.nodeValue?.match(/^\s*/)?.[0] || ''

    const trailingWhitespace =
      node.nodeValue?.match(/\s*$/)?.[0] || ''

    node.nodeValue =
      leadingWhitespace +
      translated +
      trailingWhitespace
  })
}

export default function GlobalLanguageTranslator() {
  const { language } = useLanguage()

  useEffect(() => {
    if (typeof document === 'undefined') return

    const dictionary = getGlobalTranslations(language)

    /*
     * Translate everything currently rendered.
     */
    translateTextNodes(document.body, dictionary)

    /*
     * React can render new components after the initial page load.
     * Watch for those additions and translate them too.
     */
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node instanceof Text && shouldTranslate(node)) {
              const original = node.nodeValue?.trim()

              if (original && dictionary[original]) {
                node.nodeValue = dictionary[original]
              }
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateTextNodes(node, dictionary)
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [language])

  return null
}
