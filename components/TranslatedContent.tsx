'use client'
import { useLanguage } from '@/lib/language-context'
import { useEffect, useState } from 'react'

const cache = new Map<string, string>()

export default function TranslatedContent({ text, className }: { text: string, className?: string }) {
  const { language } = useLanguage()
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (!text || language === 'en') { setOut(text); return }
    const key = `${language}:${text}`
    if (cache.has(key)) { setOut(cache.get(key)!); return }

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target: language })
    })
   .then(r => r.json())
   .then(d => {
      if (d.translated) {
        cache.set(key, d.translated)
        setOut(d.translated)
      }
    }).catch(()=>{ setOut(text) })
  }, [text, language])

  return <div className={className}>{out}</div>
}
