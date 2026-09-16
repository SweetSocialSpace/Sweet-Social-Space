'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { useTranslations } from '@/lib/translations'

export default function FaithOfTheDay() {
  const { language } = useLanguage()
  const t = useTranslations() as any
  const [verse, setVerse] = useState("")
  const [ref, setRef] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        // Pass language correctly — your design is right, dynamic for each user
        const res = await fetch(`/api/faith?lang=${encodeURIComponent(language)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('faith api failed')
        const d = await res.json()
        if (mounted && d.text) {
          setVerse(d.text)
          setRef(d.reference || d.ref || '')
        }
      } catch {
        // Fallback Spanish verses if API fails or returns English when Spanish requested
        if (mounted) {
          if (language === 'es') {
            setVerse("Porque tu corazón se enterneció, y te humillaste delante de Dios, cuando oíste sus palabras contra este lugar y contra sus habitantes, y te humillaste delante de mí, y rasgaste tus vestidos, y lloraste delante de mí, yo también te he oído, dice Yahweh.")
            setRef("2 Crónicas 34:27")
          } else {
            setVerse("because your heart was tender, and you humbled yourself before God, when you heard his words against this place, and against its inhabitants, and have humbled yourself before me, and have torn your clothes, and wept before me, I also have heard you, says Yahweh.")
            setRef("2 Chronicles 34:27")
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [language])

  return (
    <div className="bg-black/40 rounded-xl p-4 border border-white/10">
      <div className="text-purple-300 text-sm font-bold">{t?.faith?.title || t?.faith?.faithOfTheDay || 'Fe del Día'}</div>
      {loading? (
        <div className="text-white/50 mt-2 text-sm">{t?.common?.loading || 'Cargando...'}</div>
      ) : (
        <>
          <div className="text-white mt-2 leading-relaxed">"{verse}"</div>
          <div className="text-yellow-300 text-sm mt-3">{ref}</div>
        </>
      )}
    </div>
  )
}
