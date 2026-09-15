'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

export default function FaithOfTheDay() {
  const { language } = useLanguage()
  const t = useTranslations() as any
  const [verse, setVerse] = useState("For Yahweh had closed up tight all the wombs...")
  const [ref, setRef] = useState("Genesis 20:18")

  useEffect(() => {
    fetch(`/api/faith?lang=${language}`)
     .then(r=>r.json())
     .then(d=> {
        if (d.text) { setVerse(d.text); setRef(d.reference) }
      }).catch(()=>{})
  }, [language])

  return (
    <div className="bg-black/40 rounded-xl p-4 border border-white/10">
      <div className="text-purple-300 text-sm font-bold">{t?.faith?.title || t?.faith?.faithOfTheDay || 'Faith of the Day'}</div>
      <div className="text-white mt-2 leading-relaxed">"{verse}"</div>
      <div className="text-yellow-300 text-sm mt-3">{ref}</div>
    </div>
  )
}
