'use client'
import { useLanguage } from '@/lib/language-context'
import { useEffect, useState } from 'react'

export default function FaithOfTheDay() {
  const { language } = useLanguage()
  const [verse, setVerse] = useState("For Yahweh had closed up tight all the wombs...")
  const [ref, setRef] = useState("Genesis 20:18")

  useEffect(() => {
    fetch(`/api/faith?lang=${language}`)
     .then(r=>r.json())
     .then(d=> {
        if (d.text) { setVerse(d.text); setRef(d.reference) }
      })
  }, [language])

  const title = language === 'es'? 'Fe de Hoy' : 'Faith of the Day'

  return (
    <div className="bg-black/40 rounded-xl p-4">
      <div className="text-purple-300 text-sm font-bold">{title}</div>
      <div className="text-white mt-2">"{verse}"</div>
      <div className="text-yellow-300 text-sm mt-3">{ref}</div>
    </div>
  )
}
