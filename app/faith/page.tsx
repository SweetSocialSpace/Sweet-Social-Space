'use client'
import { useLanguage } from '@/lib/language-context'
import { useEffect, useState } from 'react'

export default function FaithOfTheDay() {
  const { language } = useLanguage()
  const [verse, setVerse] = useState({ text: '', ref: 'Psalms 46:10' })

  useEffect(() => {
    async function load() {
      // 1. Get English verse
      const res = await fetch('https://bible-api.com/psalms 46:10')
      const data = await res.json()

      if (language === 'en') {
        setVerse({ text: data.text, ref: data.reference })
      } else {
        // 2. Auto-translate it via your own API
        const tr = await fetch('/api/translate', {
          method: 'POST',
          body: JSON.stringify({ text: data.text, target: language })
        })
        const { translated } = await tr.json()
        setVerse({ text: translated, ref: data.reference })
      }
    }
    load()
  }, [language])

  return (
    <div>
      <div>Fe de Hoy</div>
      <div>"{verse.text}"</div>
      <div>{verse.ref}</div>
    </div>
  )
}
