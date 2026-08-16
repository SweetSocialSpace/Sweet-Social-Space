import { NextRequest, NextResponse } from 'next/server'

const MAX_ITEMS = 128
const MAX_CHARS_PER_ITEM = 5000

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Translation service is not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()

    const target =
      typeof body?.target === 'string'
        ? body.target.toLowerCase().split('-')[0]
        : ''

    const texts =
      Array.isArray(body?.texts)
        ? body.texts
        : []

    if (
      !target ||
      texts.length === 0 ||
      texts.length > MAX_ITEMS
    ) {
      return NextResponse.json(
        { error: 'Invalid translation request.' },
        { status: 400 }
      )
    }

    const cleaned = texts.map((text: unknown) =>
      typeof text === 'string'
        ? text.trim().slice(0, MAX_CHARS_PER_ITEM)
        : ''
    )

    if (cleaned.some((text: string) => !text)) {
      return NextResponse.json(
        { error: 'Translation text must be non-empty strings.' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: cleaned,
          target,
          format: 'text'
        }),
        cache: 'no-store'
      }
    )

    const payload = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            'Translation failed.'
        },
        { status: 502 }
      )
    }

    const translations =
      payload?.data?.translations || []

    return NextResponse.json({
      translations: translations.map((item: any) => ({
        text: item.translatedText,
        detectedSourceLanguage:
          item.detectedSourceLanguage || null
      }))
    })
  } catch {
    return NextResponse.json(
      { error: 'Translation service unavailable.' },
      { status: 500 }
    )
  }
}
