'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language-context'

const CACHE_PREFIX = 'sss_translation_v4:'
const BATCH_SIZE = 20

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

function cacheKey(language: string, source: string) {
  return `${CACHE_PREFIX}${language}:${source}`
}

function getCache(language: string, source: string) {
  try {
    return sessionStorage.getItem(
      cacheKey(language, source)
    )
  } catch {
    return null
  }
}

function setCache(
  language: string,
  source: string,
  value: string
) {
  try {
    sessionStorage.setItem(
      cacheKey(language, source),
      value
    )
  } catch {}
}

function shouldSkip(node: Text) {
  const parent = node.parentElement

  if (!parent) return true

  if (SKIP_TAGS.has(parent.tagName)) {
    return true
  }

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

  if (
    parent.closest('[data-sss-live]')
  ) {
    return true
  }

  return false
}

function collectTextNodes() {
  const result: Text[] = []

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  )

  let current: Node | null

  while (
    (current = walker.nextNode())
  ) {
    const node = current as Text

    if (shouldSkip(node)) {
      continue
    }

    const raw =
      originalText.get(node) ??
      node.nodeValue ??
      ''

    const source = raw.trim()

    if (!source) {
      continue
    }

    if (source.length > 3000) {
      continue
    }

    if (!originalText.has(node)) {
      originalText.set(node, raw)
    }

    result.push(node)
  }

  return result
}

function restoreOriginalText() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  )

  let current: Node | null

  while (
    (current = walker.nextNode())
  ) {
    const node = current as Text
    const original = originalText.get(node)

    if (original !== undefined) {
      node.nodeValue = original
    }
  }
}

async function requestTranslations(
  language: string,
  texts: string[]
): Promise<string[]> {
  if (!texts.length) {
    return []
  }

  const response = await fetch(
    '/api/translate',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body: JSON.stringify({
        target: language,
        texts
      }),
      cache: 'no-store'
    }
  )

  const data =
    await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error ||
        'Translation request failed'
    )
  }

  if (
    !Array.isArray(
      data?.translations
    )
  ) {
    throw new Error(
      'Invalid translation response'
    )
  }

  return data.translations.map(
    (
      item: {
        text?: string
      }
    ) =>
      item?.text || ''
  )
}

async function translatePage(
  language: string
) {
  if (language === 'en') {
    restoreOriginalText()
    return
  }

  const nodes =
    collectTextNodes()

  /*
   * Build a unique list of source strings.
   */
  const uniqueSources =
    Array.from(
      new Set(
        nodes.map(node => {
          const raw =
            originalText.get(node) ??
            node.nodeValue ??
            ''

          return raw.trim()
        })
      )
    ).filter(Boolean)

  const translatedMap =
    new Map<string, string>()

  /*
   * Use cached translations first.
   */
  const missing: string[] = []

  for (
    const source of uniqueSources
  ) {
    const cached =
      getCache(
        language,
        source
      )

    if (cached) {
      translatedMap.set(
        source,
        cached
      )
    } else {
      missing.push(source)
    }
  }

  /*
   * Ask Google for anything we don't
   * already have.
   */
  for (
    let start = 0;
    start < missing.length;
    start += BATCH_SIZE
  ) {
    const batch =
      missing.slice(
        start,
        start + BATCH_SIZE
      )

    try {
      const translated =
        await requestTranslations(
          language,
          batch
        )

      batch.forEach(
        (
          source,
          index
        ) => {
          const value =
            translated[index]

          if (
            value &&
            value !== source
          ) {
            setCache(
              language,
              source,
              value
            )

            translatedMap.set(
              source,
              value
            )
          }
        }
      )
    } catch (error) {
      console.error(
        '[Sweet Social Space] Translation batch failed:',
        error
      )

      /*
       * Retry each individual string.
       * One bad string must NEVER stop
       * the rest of the platform.
       */
      for (
        const source of batch
      ) {
        try {
          const result =
            await requestTranslations(
              language,
              [source]
            )

          const value =
            result[0]

          if (
            value &&
            value !== source
          ) {
            setCache(
              language,
              source,
              value
            )

            translatedMap.set(
              source,
              value
            )
          }
        } catch (singleError) {
          console.error(
            '[Sweet Social Space] Translation failed:',
            singleError
          )
        }
      }
    }
  }

  /*
   * IMPORTANT:
   * Apply translations to EVERY occurrence,
   * not just the first occurrence of a string.
   */
  nodes.forEach(node => {
    if (!node.isConnected) {
      return
    }

    const raw =
      originalText.get(node) ??
      node.nodeValue ??
      ''

    const source =
      raw.trim()

    const translated =
      translatedMap.get(source)

    if (
      !translated ||
      translated === source
    ) {
      return
    }

    node.nodeValue =
      raw.replace(
        source,
        translated
      )
  })
}

export default function GlobalLanguageTranslator() {
  const {
    language
  } = useLanguage()

  const running =
    useRef(false)

  const rerun =
    useRef(false)

  const observer =
    useRef<MutationObserver | null>(
      null
    )

  const timer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null)

  useEffect(() => {
    let cancelled = false

    const schedule = () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }

      timer.current =
        setTimeout(
          () => {
            void run()
          },
          250
        )
    }

    const run = async () => {
      if (cancelled) {
        return
      }

      if (running.current) {
        rerun.current = true
        return
      }

      running.current = true
      rerun.current = false

      /*
       * Stop watching while we modify the DOM.
       */
      observer.current?.disconnect()

      try {
        /*
         * Always restore the real source language
         * before translating into the new language.
         *
         * This makes switching:
         *
         * English → Chinese → Spanish → English
         *
         * reliable.
         */
        restoreOriginalText()

        await translatePage(
          language
        )
      } catch (error) {
        console.error(
          '[Sweet Social Space] Global translation error:',
          error
        )
      } finally {
        running.current = false

        if (cancelled) {
          return
        }

        /*
         * Watch for React-rendered content.
         *
         * This is important for:
         * - feed posts
         * - dialogs
         * - menus
         * - dynamically loaded components
         * - lazy-loaded components
         */
        observer.current?.observe(
          document.body,
          {
            childList: true,
            subtree: true,
            characterData: true
          }
        )

        if (rerun.current) {
          rerun.current = false
          schedule()
        }
      }
    }

    observer.current =
      new MutationObserver(
        mutations => {
          if (running.current) {
            rerun.current = true
            return
          }

          const relevant =
            mutations.some(
              mutation =>
                mutation.type ===
                  'childList' ||
                mutation.type ===
                  'characterData'
            )

          if (relevant) {
            schedule()
          }
        }
      )

    observer.current.observe(
      document.body,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    )

    /*
     * Run immediately.
     *
     * No refresh required.
     */
    void run()

    return () => {
      cancelled = true

      observer.current?.disconnect()

      observer.current = null

      if (timer.current) {
        clearTimeout(
          timer.current
        )
      }

      restoreOriginalText()
    }
  }, [language])

  return null
}
