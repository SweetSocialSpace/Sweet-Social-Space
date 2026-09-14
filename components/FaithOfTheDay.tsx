'use client'
import { useLanguage } from '@/lib/language-context'
import { useEffect, useState } from 'react'

const FALLBACK_VERSES: Record<string, {es: string, en: string}> = {
  "Psalms 46:10": {
    en: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth.",
    es: "Estad quietos, y conoced que yo soy Dios. Exaltado seré entre las naciones, enaltecido seré en la tierra."
  }
}

export default function FaithCard() {
const { language } = useLanguage()
useEffect(() => {
  fetch(`/api/faith?lang=${language}`).then...
}, [language])
  const [verse, setVerse] = useState(FALLBACK_VERSES["Psalms 46:10"].en)
  const [ref, setRef] = useState("Psalms 46:10")

  useEffect(() => {
    fetch('/api/faith') // your own API, not bible-api.com directly
     .then(r => r.json())
     .then(data => {
        if (!data?.text) throw new Error("empty")
        // if Spanish, use translated version from fallback or translate
        if (language === 'es' && FALLBACK_VERSES[data.reference]?.es) {
          setVerse(FALLBACK_VERSES[data.reference].es)
        } else {
          setVerse(data.text)
        }
        setRef(data.reference || data.ref)
      })
     .catch(() => {
        // bible-api down - show fallback translated verse
        setVerse(language === 'es'? FALLBACK_VERSES["Psalms 46:10"].es : FALLBACK_VERSES["Psalms 46:10"].en)
      })
  }, [language])

  return (
    <div className="p-4">
      <div className="text-purple-300 text-sm font-bold">Fe de Hoy</div>
      <div className="text-white text-lg">"{verse}"</div>
      <div className="text-yellow-300 text-sm mt-2">{ref}</div>
    </div>
  )
}
