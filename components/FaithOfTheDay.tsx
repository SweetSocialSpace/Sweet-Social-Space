'use client'
import { useLanguage } from '@/lib/language-context'
import { useEffect, useState } from 'react'

const FALLBACK: Record<string, any> = {
  "John 3:16": {
    en: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
    es: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna."
  },
  "Psalms 46:10": {
    en: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth.",
    es: "Estad quietos, y conoced que yo soy Dios. Exaltado seré entre las naciones, enaltecido seré en la tierra."
  }
}

export default function FaithOfTheDay() {
  const { language } = useLanguage()
  const [verse, setVerse] = useState(FALLBACK["John 3:16"].en)
  const [ref, setRef] = useState("John 3:16")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/faith?lang=${language}`)
        const data = await res.json()
        if (data?.text) {
          setVerse(data.text)
          setRef(data.reference || data.ref)
          return
        }
      } catch (e) {}
      // fallback if api fails
      const key = FALLBACK[ref]? ref : "John 3:16"
      setVerse(language === 'es'? FALLBACK[key].es : FALLBACK[key].en)
    }
    load()
  }, [language])

  return (
    <div className="bg-black/40 rounded-xl p-4">
      <div className="text-purple-300 text-sm font-bold">Fe de Hoy</div>
      <div className="text-white mt-2 text-base">"{verse}"</div>
      <div className="text-yellow-300 text-sm mt-3">{ref}</div>
    </div>
  )
}
