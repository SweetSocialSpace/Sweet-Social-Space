'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

const cache = new Map<string, string>()

export function useAutoTranslateText(text: string) {
  const { language } = useLanguage()
  const isEnglish =!language || language.toLowerCase().startsWith('en')
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    if (!text || isEnglish) { setTranslated(text); return }
    const key = `${language}:${text}`
    if (cache.has(key)) { setTranslated(cache.get(key)!); return }

    let mounted = true
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: language, texts: [text] }),
    })
   .then(r=>r.json())
   .then(j=>{
      const tr = j.translations?.[0]?.text || j.translations?.[0]?.translatedText || j[0] || text
      cache.set(key, tr)
      if (mounted) setTranslated(tr)
    })
   .catch(()=>{ if(mounted) setTranslated(text) })

    return ()=>{ mounted = false }
  }, [text, language, isEnglish])

  return translated
}

// Batch version for lists like events
export function useAutoTranslateList(texts: string[]) {
  const { language } = useLanguage()
  const isEnglish =!language || language.toLowerCase().startsWith('en')
  const [translated, setTranslated] = useState(texts)

  useEffect(() => {
    if (!texts.length || isEnglish) { setTranslated(texts); return }
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: language, texts }),
    })
   .then(r=>r.json())
   .then(j=>{
      const list = j.translations?.map((x:any)=> x.text || x.translatedText || x) || j || texts
      setTranslated(list)
    })
   .catch(()=> setTranslated(texts))
  }, [JSON.stringify(texts), language])

  return translated
}
