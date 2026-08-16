'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language-context'
import { getGlobalTranslations } from '@/lib/translations'

const CACHE_PREFIX = 'sss_global_translation_v6:'
const BATCH_SIZE = 12
const RETRY_DELAY = 300

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

function cacheKey(
  language: string,
  source: string
) {
  return `${CACHE_PREFIX}${language}:${source}`
}

function getCache(
  language: string,
  source: string
) {
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
  translated: string
) {
  try {
    sessionStorage.setItem(
      cacheKey(language, source),
      translated
    )
  } catch {}
}

function shouldSkip(
  node: Text
) {
  const parent =
    node.parentElement

  if (!parent) return true

  if (
    SKIP_TAGS.has(
      parent.tagName
    )
  ) {
    return true
  }

  if (
    parent.closest(
      '[data-sss-no-translate]'
    )
  ) {
    return true
  }

  if (
    parent.closest(
      '[contenteditable="true"]'
    )
  ) {
    return true
  }

  /*
   * Live widgets such as weather own
   * their own translation.
   */
  if (
    parent.closest(
      '[data-sss-live]'
    )
  ) {
    return true
  }

  return false
}

function collectTextNodes() {
  const nodes: Text[] = []

  const walker =
    document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    )

  let current: Node | null

  while (
    (current =
      walker.nextNode())
  ) {
    const node =
      current as Text

    if (shouldSkip(node)) {
      continue
    }

    const raw =
      originalText.get(node) ??
      node.nodeValue ??
      ''

    const source =
      raw.trim()

    if (!source) continue

    /*
     * Ignore giant blobs of text. Individual
     * interface strings and posts are handled.
     */
    if (
      source.length > 2000
    ) {
      continue
    }

    if (
      !originalText.has(node)
    ) {
      originalText.set(
        node,
        raw
      )
    }

    nodes.push(node)
  }

  return nodes
}

function collectAttributes() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
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
      element.closest(
        '[data-sss-live]'
      )
    ) {
      return false
    }

    return true
  })
}

async function googleTranslate(
  language: string,
  texts: string[]
): Promise<string[]> {
  if (!texts.length) {
    return []
  }

  const response =
    await fetch(
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

  const payload =
    await response
      .json()
      .catch(() => null)

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

  return payload.translations.map(
    (item: {
      text?: string
    }) =>
      item?.text || ''
  )
}

async function translateOne(
  language: string,
  source: string
) {
  const cached =
    getCache(
      language,
      source
    )

  if (cached) {
    return cached
  }

  /*
   * First check the platform's existing
   * translation dictionaries.
   */
  const dictionary =
    getGlobalTranslations(
      language
    )

  const known =
    dictionary[source]

  if (
    known &&
    known !== source
  ) {
    setCache(
      language,
      source,
      known
    )

    return known
  }

  /*
   * Anything not in the dictionary goes
   * through Google Translation.
   */
  for (
    let attempt = 0;
    attempt < 2;
    attempt++
  ) {
    try {
      const result =
        await googleTranslate(
          language,
          [source]
        )

      const translated =
        result[0] || source

      if (
        translated !== source
      ) {
        setCache(
          language,
          source,
          translated
        )
      }

      return translated
    } catch (error) {
      if (attempt === 1) {
        console.error(
          '[Sweet Social Space translation]',
          error
        )

        return source
      }

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            RETRY_DELAY
          )
      )
    }
  }

  return source
}

async function translateTextNodes(
  language: string
) {
  const nodes =
    collectTextNodes()

  const pending: Array<{
    node: Text
    source: string
  }> = []

  for (
    const node of nodes
  ) {
    const raw =
      originalText.get(node) ??
      node.nodeValue ??
      ''

    const source =
      raw.trim()

    if (!source) {
      continue
    }

    const cached =
      getCache(
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

    pending.push({
      node,
      source
    })
  }

  /*
   * Deduplicate identical strings.
   */
  const unique =
    Array.from(
      new Set(
        pending.map(
          item => item.source
        )
      )
    )

  const results =
    new Map<string, string>()

  /*
   * Translate in small batches.
   * This avoids one giant request failing
   * and taking the entire platform down.
   */
  for (
    let i = 0;
    i < unique.length;
    i += BATCH_SIZE
  ) {
    const batch =
      unique.slice(
        i,
        i + BATCH_SIZE
      )

    const dictionary =
      getGlobalTranslations(
        language
      )

    const googleSources: string[] =
      []

    const googleIndexes: number[] =
      []

    const translated =
      new Array<string>(
        batch.length
      ).fill('')

    batch.forEach(
      (
        source,
        index
      ) => {
        const known =
          dictionary[source]

        if (
          known &&
          known !== source
        ) {
          translated[index] =
            known
        } else {
          googleSources.push(
            source
          )

          googleIndexes.push(
            index
          )
        }
      }
    )

    if (
      googleSources.length
    ) {
      try {
        const google =
          await googleTranslate(
            language,
            googleSources
          )

        google.forEach(
          (
            value: string,
            index: number
          ) => {
            translated[
              googleIndexes[index]
            ] =
              value ||
              googleSources[index]
          }
        )
      } catch (error) {
        console.error(
          '[Sweet Social Space translation batch]',
          error
        )

        /*
         * Retry each failed item individually.
         */
        for (
          let index = 0;
          index <
          googleSources.length;
          index++
        ) {
          translated[
            googleIndexes[index]
          ] =
            await translateOne(
              language,
              googleSources[index]
            )
        }
      }
    }

    batch.forEach(
      (
        source,
        index
      ) => {
        const value =
          translated[index] ||
          source

        results.set(
          source,
          value
        )

        if (
          value !== source
        ) {
          setCache(
            language,
            source,
            value
          )
        }
      }
    )
  }

  /*
   * Apply the translations only after
   * all requests in the batch are finished.
   */
  pending.forEach(
    ({
      node,
      source
    }) => {
      if (
        !node.isConnected
      ) {
        return
      }

      const value =
        results.get(
          source
        )

      if (!value) {
        return
      }

      const raw =
        originalText.get(
          node
        ) ??
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

async function translateAttributes(
  language: string
) {
  const elements =
    collectAttributes()

  for (
    const element of elements
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

      if (!value) {
        continue
      }

      if (
        !saved[attribute]
      ) {
        saved[attribute] =
          value
      }

      const source =
        saved[attribute]

      const translated =
        await translateOne(
          language,
          source
        )

      if (
        translated &&
        element.isConnected
      ) {
        element.setAttribute(
          attribute,
          translated
        )
      }
    }
  }
}

function restoreOriginals() {
  const walker =
    document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    )

  let current: Node | null

  while (
    (current =
      walker.nextNode())
  ) {
    const node =
      current as Text

    const original =
      originalText.get(
        node
      )

    if (
      original !== undefined
    ) {
      node.nodeValue =
        original
    }
  }

  const elements =
    Array.from(
      document.querySelectorAll<HTMLElement>(
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

    if (!saved) {
      continue
    }

    for (
      const attribute of [
        'placeholder',
        'title',
        'aria-label'
      ] as const
    ) {
      const original =
        saved[attribute]

      if (
        original !== undefined
      ) {
        element.setAttribute(
          attribute,
          original
        )
      }
    }
  }
}

export default function GlobalLanguageTranslator() {
  const {
    language
  } = useLanguage()

  const running =
    useRef(false)

  const observer =
    useRef<MutationObserver | null>(
      null
    )

  const timer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null)

  const pending =
    useRef(false)

  useEffect(() => {
    let cancelled = false

    const schedule =
      () => {
        if (
          timer.current
        ) {
          clearTimeout(
            timer.current
          )
        }

        timer.current =
          setTimeout(
            () => {
              void run()
            },
            400
          )
      }

    const run =
      async () => {
        if (
          cancelled
        ) {
          return
        }

        if (
          running.current
        ) {
          pending.current =
            true

          return
        }

        running.current =
          true

        pending.current =
          false

        /*
         * IMPORTANT:
         * Disconnect the observer while
         * translations are written.
         */
        observer.current?.disconnect()

        try {
          restoreOriginals()

          if (
            language !== 'en'
          ) {
            await translateTextNodes(
              language
            )

            if (
              !cancelled
            ) {
              await translateAttributes(
                language
              )
            }
          }
        } catch (error) {
          console.error(
            '[Sweet Social Space global translator]',
            error
          )
        } finally {
          running.current =
            false

          if (
            cancelled
          ) {
            return
          }

          /*
           * Watch BOTH new elements and
           * React text-node updates.
           */
          observer.current?.observe(
            document.body,
            {
              childList: true,
              subtree: true,
              characterData: true
            }
          )

          if (
            pending.current
          ) {
            pending.current =
              false

            schedule()
          }
        }
      }

    observer.current =
      new MutationObserver(
        mutations => {
          if (
            running.current
          ) {
            pending.current =
              true

            return
          }

          /*
           * React can update existing text
           * nodes without adding a child.
           */
          const relevant =
            mutations.some(
              mutation =>
                mutation.type ===
                  'childList' ||
                mutation.type ===
                  'characterData'
            )

          if (
            relevant
          ) {
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

    void run()

    return () => {
      cancelled = true

      observer.current?.disconnect()

      observer.current =
        null

      if (
        timer.current
      ) {
        clearTimeout(
          timer.current
        )
      }

      restoreOriginals()
    }
  }, [language])

  return null
}
