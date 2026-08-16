'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

const cache = new Map<
  string,
  {
    text: string
    source?: string | null
  }
>()

function getCacheKey(text: string, target: string) {
  return `${target}:${text}`
}

export default function TranslatedContent({
  text,
  className = ''
}: {
  text: string
  className?: string
}) {
  const { language } = useLanguage()

  const [translated, setTranslated] =
    useState<string | null>(null)

  const [sourceLanguage, setSourceLanguage] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [showOriginal, setShowOriginal] =
    useState(false)

  const cleanText = useMemo(
    () => (text || '').trim(),
    [text]
  )

  useEffect(() => {
    let cancelled = false

    if (!cleanText) return

    const key = getCacheKey(
      cleanText,
      language
    )

    const cached = cache.get(key)

    if (cached) {
      setTranslated(cached.text)
      setSourceLanguage(cached.source || null)
      return
    }

    setLoading(true)

    fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: language,
        texts: [cleanText]
      })
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error('Translation failed')
        }

        return response.json()
      })
      .then(data => {
        if (cancelled) return

        const result =
          data?.translations?.[0]

        if (!result?.text) {
          throw new Error(
            'Translation missing'
          )
        }

        cache.set(key, {
          text: result.text,
          source:
            result.detectedSourceLanguage
        })

        setTranslated(result.text)

        setSourceLanguage(
          result.detectedSourceLanguage ||
          null
        )
      })
      .catch(() => {
        if (!cancelled) {
          setTranslated(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [cleanText, language])

  const showingTranslation =
    translated &&
    translated !== cleanText &&
    !showOriginal

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap break-words leading-6">
        {showingTranslation
          ? translated
          : cleanText}
      </p>

      {translated &&
        translated !== cleanText && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">

            <span className="text-black/40">
              {sourceLanguage
                ? `Translated from ${sourceLanguage.toUpperCase()}`
                : 'Translated'}
            </span>

            <button
              type="button"
              onClick={() =>
                setShowOriginal(
                  value => !value
                )
              }
              className="font-bold underline text-black/60 hover:text-black"
            >
              {showOriginal
                ? 'Show translation'
                : 'View original'}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowOriginal(false)
              }
              className="font-bold underline text-black/60 hover:text-black"
            >
              Translate
            </button>

          </div>
        )}

      {loading && !translated && (
        <div className="mt-1 text-xs text-black/40">
          Translating…
        </div>
      )}
    </div>
  )
}
