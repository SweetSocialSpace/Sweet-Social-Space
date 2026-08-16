'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language-context'
import { getGlobalTranslations } from '@/lib/translations'

const TEXT_CACHE_PREFIX = 'sss_translation_v4:'
const MAX_TEXT_LENGTH = 4000
const MAX_BATCH = 25

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'CODE',
  'PRE',
  'SVG',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'OPTION'
])

const originalText = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<
  HTMLElement,
  Record<string, string>
>()

function cacheKey(language: string, text: string) {
  return `${TEXT_CACHE_PREFIX}${language}:${text}`
}

function readCache(language: string, text: string) {
  try {
    return sessionStorage.getItem(
      cacheKey(language, text)
    )
  } catch {
    return null
  }
}

function writeCache(
  language: string,
  text: string,
  translated: string
) {
  try {
    sessionStorage.setItem(
      cacheKey(language, text),
      translated
    )
  } catch {}
}

function shouldSkipText(node: Text) {
  const parent = node.parentElement

  if (!parent) return true
  if (SKIP_TAGS.has(parent.tagName)) return true

  if (
    parent.closest('[data-sss-no-translate]')
  ) {
    return true
  }

  if (
    parent.closest('[contenteditable="true"]')
  ) {
    return true
  }

  // Weather and other live data are responsible
  // for their own translations.
  if (
    parent.closest('[data-sss-live]')
  ) {
    return true
  }

  return false
}

function collectTextNodes(root: HTMLElement) {
  const nodes: Text[] = []

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT
  )

  let current: Node | null

  while ((current = walker.nextNode())) {
    const node = current as Text

    const raw =
      originalText.get(node) ??
      node.nodeValue ??
      ''

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

function collectAttributes(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      '[placeholder], [title], [aria-label]'
    )
  ).filter(element => {
    if (
      element.closest(
        '[data-sss-no-translate]'
      )
    ) {
      return false
    }

    if (
      element.closest('[data-sss-live]')
    ) {
      return false
    }

    if (SKIP_TAGS.has(element.tagName)) {
      return false
    }

    return true
  })
}

async function translateBatch(
  language: string,
  texts: string[]
): Promise<string[]> {
  if (!texts.length) return []

  /*
   * First use translations that already exist
   * in the application's own language dictionaries.
   *
   * This makes all known platform UI strings
   * translate without waiting for Google.
   */
  const dictionary =
    getGlobalTranslations(language)

  const result: string[] = []
  const missing: string[] = []
  const missingIndexes: number[] = []

  texts.forEach((text, index) => {
    const known = dictionary[text]

    if (
      known &&
      known !== text
    ) {
      result[index] = known
    } else {
      result[index] = ''
      missing.push(text)
      missingIndexes.push(index)
    }
  })

  /*
   * Anything not already in our dictionary
   * goes through Google Translation.
   */
  if (missing.length) {
    const response = await fetch(
      '/api/translate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: language,
          texts: missing
        }),
        cache: 'no-store'
      }
    )

    const payload =
      await response.json().catch(
        () => null
      )

    if (!response.ok) {
      throw new Error(
        payload?.error ||
          'Translation request failed'
      )
    }

    if (
      !Array.isArray(
        payload?.translations
      )
    ) {
      throw new Error(
        'Invalid translation response'
      )
    }

    payload.translations.forEach(
      (
        item: {
          text?: string
        },
        index: number
      ) => {
        const originalIndex =
          missingIndexes[index]

        result[originalIndex] =
          item?.text || ''
      }
    )
  }

  return result
}

async function translateWithFallback(
  language: string,
  texts: string[]
): Promise<string[]> {
  try {
    return await translateBatch(
      language,
      texts
    )
  } catch (error) {
    console.error(
      '[Sweet Social Space] Batch translation failed:',
      error
    )

    /*
     * Retry individually so one bad string
     * doesn't prevent the rest of the page.
     */
    const results: string[] =
      new Array(texts.length).fill('')

    for (
      let index = 0;
      index < texts.length;
      index++
    ) {
      try {
        const one =
          await translateBatch(
            language,
            [texts[index]]
          )

        results[index] =
          one[0] || ''
      } catch (itemError) {
        console.error(
          '[Sweet Social Space] Individual translation failed:',
          itemError
        )
      }
    }

    return results
  }
}

async function translatePage(
  language: string,
  root: HTMLElement
) {
  if (language === 'en') return

  const nodes =
    collectTextNodes(root)

  const pendingTexts: string[] = []
  const pendingNodes: Text[] = []
  const seen = new Set<string>()

  for (const node of nodes) {
    const raw =
      originalText.get(node) ??
      node.nodeValue ??
      ''

    const source = raw.trim()

    if (!source) continue
    if (seen.has(source)) continue

    const cached =
      readCache(
        language,
        source
      )

    if (cached) {
      node.nodeValue =
        raw.replace(
          source,
          cached
        )

      continue
    }

    seen.add(source)

    pendingTexts.push(source)
    pendingNodes.push(node)
  }

  for (
    let start = 0;
    start < pendingTexts.length;
    start += MAX_BATCH
  ) {
    const texts =
      pendingTexts.slice(
        start,
        start + MAX_BATCH
      )

    const batchNodes =
      pendingNodes.slice(
        start,
        start + MAX_BATCH
      )

    const translated =
      await translateWithFallback(
        language,
        texts
      )

    translated.forEach(
      (
        value: string,
        index: number
      ) => {
        const source =
          texts[index]

        const node =
          batchNodes[index]

        if (!value) return
        if (!node.isConnected) return

        writeCache(
          language,
          source,
          value
        )

        const raw =
          originalText.get(node) ??
          node.nodeValue ??
          ''

        node.nodeValue =
          raw.replace(
            source,
            value
          )
      }
    )
  }

  /*
   * Translate placeholders,
   * titles and aria labels.
   */
  const attributeWork: Array<{
    element: HTMLElement
    attribute:
      | 'placeholder'
      | 'title'
      | 'aria-label'
    source: string
  }> = []

  for (
    const element of
    collectAttributes(root)
  ) {
    let saved =
      originalAttributes.get(
        element
      )

    if (!saved) {
      saved = {}
      originalAttributes.set(
        element,
        saved
      )
    }

    for (
      const attribute of [
        'placeholder',
        'title',
        'aria-label'
      ] as const
    ) {
      const value =
        element.getAttribute(
          attribute
        )

      if (
        !value ||
        value.length >
          MAX_TEXT_LENGTH
      ) {
        continue
      }

      if (!saved[attribute]) {
        saved[attribute] =
          value
      }

      const source =
        saved[attribute]

      const cached =
        readCache(
          language,
          source
        )

      if (cached) {
        element.setAttribute(
          attribute,
          cached
        )
      } else {
        attributeWork.push({
          element,
          attribute,
          source
        })
      }
    }
  }

  for (
    let start = 0;
    start < attributeWork.length;
    start += MAX_BATCH
  ) {
    const batch =
      attributeWork.slice(
        start,
        start + MAX_BATCH
      )

    const translated =
      await translateWithFallback(
        language,
        batch.map(
          item => item.source
        )
      )

    translated.forEach(
      (
        value: string,
        index: number
      ) => {
        const item =
          batch[index]

        if (!value) return

        writeCache(
          language,
          item.source,
          value
        )

        if (
          item.element.isConnected
        ) {
          item.element.setAttribute(
            item.attribute,
            value
          )
        }
      }
    )
  }
}

function restoreOriginals(
  root: HTMLElement
) {
  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    )

  let current: Node | null

  while (
    (current = walker.nextNode())
  ) {
    const node =
      current as Text

    const original =
      originalText.get(node)

    if (
      original !== undefined
    ) {
      node.nodeValue =
        original
    }
  }

  const elements =
    Array.from(
      root.querySelectorAll<HTMLElement>(
        '[placeholder], [title], [aria-label]'
      )
    )

  for (
    const element of elements
  ) {
    const saved =
      originalAttributes.get(
        element
      )

    if (!saved) continue

    for (
      const attribute of [
        'placeholder',
        'title',
        'aria-label'
      ] as const
    ) {
      if (
        saved[attribute] !==
        undefined
      ) {
        element.setAttribute(
          attribute,
          saved[attribute]
        )
      }
    }
  }
}

export default function GlobalLanguageTranslator() {
  const { language } =
    useLanguage()

  const languageRef =
    useRef(language)

  const runningRef =
    useRef(false)

  const pendingRef =
    useRef(false)

  const observerRef =
    useRef<MutationObserver | null>(
      null
    )

  const timerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null)

  useEffect(() => {
    languageRef.current =
      language
  }, [language])

  useEffect(() => {
    const root =
      document.body

    const schedule =
      () => {
        if (timerRef.current) {
          clearTimeout(
            timerRef.current
          )
        }

        timerRef.current =
          setTimeout(
            () => {
              void run()
            },
            700
          )
      }

    const run =
      async () => {
        if (
          runningRef.current
        ) {
          pendingRef.current =
            true

          return
        }

        runningRef.current =
          true

        pendingRef.current =
          false

        /*
         * Stop watching the DOM while
         * we modify it.
         */
        observerRef.current?.disconnect()

        try {
          restoreOriginals(
            root
          )

          await translatePage(
            languageRef.current,
            root
          )
        } catch (error) {
          console.error(
            '[GlobalLanguageTranslator]',
            error
          )
        } finally {
          runningRef.current =
            false

          /*
           * Start watching again after
           * translation is complete.
           */
          observerRef.current?.observe(
            root,
            {
              childList: true,
              subtree: true
            }
          )

          if (
            pendingRef.current
          ) {
            pendingRef.current =
              false

            schedule()
          }
        }
      }

    observerRef.current =
      new MutationObserver(
        () => {
          if (
            !runningRef.current
          ) {
            schedule()
          } else {
            pendingRef.current =
              true
          }
        }
      )

    observerRef.current.observe(
      root,
      {
        childList: true,
        subtree: true
      }
    )

    void run()

    return () => {
      observerRef.current?.disconnect()

      observerRef.current =
        null

      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current
        )
      }

      restoreOriginals(
        root
      )
    }
  }, [language])

  return null
}
