'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language-context'

const TEXT_CACHE_PREFIX = 'sss_translation_v2:'
const MAX_TEXT_LENGTH = 4000
const MAX_BATCH = 80
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG'
])

const originalText = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<HTMLElement, Record<string, string>>()

function cacheKey(language: string, text: string) {
  return `${TEXT_CACHE_PREFIX}${language}:${text}`
}

function readCache(language: string, text: string) {
  try {
    const value = sessionStorage.getItem(cacheKey(language, text))
    return value || null
  } catch {
    return null
  }
}

function writeCache(language: string, text: string, translated: string) {
  try {
    sessionStorage.setItem(cacheKey(language, text), translated)
  } catch {}
}

function shouldSkipText(node: Text) {
  const parent = node.parentElement
  if (!parent) return true
  if (SKIP_TAGS.has(parent.tagName)) return true
  if (parent.closest('[data-sss-no-translate]')) return true
  if (parent.closest('input, textarea, select, option')) return true
  return false
}

function collectTextNodes(root: Node) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  let current: Node | null
  while ((current = walker.nextNode())) {
    const node = current as Text
    const raw = originalText.get(node) ?? node.nodeValue ?? ''
    const trimmed = raw.trim()

    if (!trimmed) continue
    if (trimmed.length > MAX_TEXT_LENGTH) continue
    if (shouldSkipText(node)) continue

    if (!originalText.has(node)) {
      originalText.set(node, raw)
    }

    nodes.push(node)
  }

  return nodes
}

function collectAttributes(root: Node) {
  const elements = Array.from(
    root instanceof HTMLElement
      ? root.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]')
      : document.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]')
  )

  return elements.filter(el => {
    if (el.closest('[data-sss-no-translate]')) return false
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false
    return true
  })
}

async function translateBatch(
  language: string,
  texts: string[]
): Promise<string[]> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: language,
      texts
    }),
    cache: 'no-store'
  })

  if (!response.ok) throw new Error('Translation request failed')

  const payload = await response.json()
  const results = payload?.translations

  if (!Array.isArray(results)) {
    throw new Error('Translation response was invalid')
  }

  return results.map((item: any) => item?.text || '')
}

async function translatePage(language: string, root: HTMLElement) {
  if (language === 'en') return

  const nodes = collectTextNodes(root)
  const attributes = collectAttributes(root)

  const pendingTexts: string[] = []
  const pendingNodes: Text[] = []
  const seen = new Set<string>()

  for (const node of nodes) {
    const source = (originalText.get(node) ?? node.nodeValue ?? '').trim()
    if (!source || seen.has(source)) continue

    const cached = readCache(language, source)
    if (cached) {
      node.nodeValue = (originalText.get(node) ?? node.nodeValue ?? '').replace(source, cached)
      continue
    }

    seen.add(source)
    pendingTexts.push(source)
    pendingNodes.push(node)
  }

  for (let i = 0; i < pendingTexts.length; i += MAX_BATCH) {
    const texts = pendingTexts.slice(i, i + MAX_BATCH)
    const batchNodes = pendingNodes.slice(i, i + MAX_BATCH)

    try {
      const translated = await translateBatch(language, texts)

      translated.forEach((value, index) => {
        const source = texts[index]
        const node = batchNodes[index]
        if (!value || !node.isConnected) return

        writeCache(language, source, value)
        const raw = originalText.get(node) ?? node.nodeValue ?? ''
        node.nodeValue = raw.replace(source, value)
      })
    } catch {
      // Leave the original English text visible if translation fails.
    }
  }

  const attributeWork: Array<{
    element: HTMLElement
    attribute: 'placeholder' | 'title' | 'aria-label'
    source: string
  }> = []

  for (const element of attributes) {
    const saved = originalAttributes.get(element) ?? {}
    if (!originalAttributes.has(element)) originalAttributes.set(element, saved)

    for (const attribute of ['placeholder', 'title', 'aria-label'] as const) {
      const value = element.getAttribute(attribute)
      if (!value || value.length > MAX_TEXT_LENGTH) continue
      if (!saved[attribute]) saved[attribute] = value

      const source = saved[attribute]
      const cached = readCache(language, source)
      if (cached) {
        element.setAttribute(attribute, cached)
      } else {
        attributeWork.push({ element, attribute, source })
      }
    }
  }

  for (let i = 0; i < attributeWork.length; i += MAX_BATCH) {
    const batch = attributeWork.slice(i, i + MAX_BATCH)
    try {
      const translated = await translateBatch(
        language,
        batch.map(item => item.source)
      )

      translated.forEach((value, index) => {
        const item = batch[index]
        if (!value) return
        writeCache(language, item.source, value)
        item.element.setAttribute(item.attribute, value)
      })
    } catch {}
  }
}

function restoreOriginals(root: HTMLElement) {
  const nodes = collectTextNodes(root)
  for (const node of nodes) {
    const original = originalText.get(node)
    if (original !== undefined) node.nodeValue = original
  }

  const elements = collectAttributes(root)
  for (const element of elements) {
    const saved = originalAttributes.get(element)
    if (!saved) continue

    for (const attribute of ['placeholder', 'title', 'aria-label'] as const) {
      if (saved[attribute] !== undefined) {
        element.setAttribute(attribute, saved[attribute])
      }
    }
  }
}

export default function GlobalLanguageTranslator() {
  const { language } = useLanguage()
  const languageRef = useRef(language)

  useEffect(() => {
    languageRef.current = language
  }, [language])

  useEffect(() => {
    const root = document.body
    let timer: ReturnType<typeof setTimeout> | null = null
    let running = false
    let rerun = false

    const run = async () => {
      if (running) {
        rerun = true
        return
      }

      running = true
      rerun = false

      restoreOriginals(root)
      await translatePage(languageRef.current, root)

      running = false

      if (rerun) {
        rerun = false
        if (timer) clearTimeout(timer)
        timer = setTimeout(run, 100)
      }
    }

    const observer = new MutationObserver(() => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(run, 250)
    })

    observer.observe(root, {
      childList: true,
      subtree: true
    })

    run()

    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
      restoreOriginals(root)
    }
  }, [language])

  return null
}
