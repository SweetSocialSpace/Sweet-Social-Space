'use client'
import { useLanguage } from '@/lib/language-context'
import { useEffect, useState } from 'react'

const cache = new Map<string, string>()

export default function AutoTranslate({ text }: { text: string }) {
  const { language } = useLanguage()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    if (!text || language === 'en') { setTranslated(text); return }
    
    const key = `${language}:${text}`
    if (cache.has(key)) { setTranslated(cache.get(key)!); return }

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target: language })
    })
    .then(r => r.json())
    .then(d => {
      if (d.translated) {
        cache.set(key, d.translated)
        setTranslated(d.translated)
      }
    })
  }, [text, language])

  return <span>{translated}</span>
}
