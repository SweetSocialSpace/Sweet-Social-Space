'use client'

import {
  useEffect,
  useState
} from 'react'

import {
  useLanguage
} from '@/lib/language-context'

type Props = {
  text: string
  className?: string
}

export default function TranslatedContent({
  text,
  className = ''
}: Props) {
  const {
    language
  } = useLanguage()

  const [
    translated,
    setTranslated
  ] = useState(text)

  const [
    showingOriginal,
    setShowingOriginal
  ] = useState(false)

  const [
    loading,
    setLoading
  ] = useState(false)

  useEffect(() => {
    let cancelled = false

    setShowingOriginal(false)

    if (
      !text ||
      language === 'en'
    ) {
      setTranslated(text)
      return
    }

    const translate =
      async () => {
        setLoading(true)

        try {
          const response =
            await fetch(
              '/api/translate',
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json'
                },
                body:
                  JSON.stringify({
                    target:
                      language,
                    texts: [text]
                  }),
                cache:
                  'no-store'
              }
            )

          const data =
            await response
              .json()
              .catch(
                () => null
              )

          const value =
            data?.translations?.[0]
              ?.text

          if (
            !cancelled &&
            value
          ) {
            setTranslated(
              value
            )
          } else if (
            !cancelled
          ) {
            setTranslated(
              text
            )
          }
        } catch {
          if (
            !cancelled
          ) {
            setTranslated(
              text
            )
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            )
          }
        }
      }

    void translate()

    return () => {
      cancelled = true
    }
  }, [
    text,
    language
  ])

  const displayed =
    showingOriginal
      ? text
      : translated

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap break-words leading-6">
        {loading
          ? text
          : displayed}
      </p>

      {language !== 'en' &&
        translated !== text && (
          <button
            type="button"
            onClick={() =>
              setShowingOriginal(
                value => !value
              )
            }
            className="mt-2 text-xs font-bold text-blue-600 hover:underline"
          >
            {showingOriginal
              ? 'Translate'
              : 'See original'}
          </button>
        )}
    </div>
  )
}
