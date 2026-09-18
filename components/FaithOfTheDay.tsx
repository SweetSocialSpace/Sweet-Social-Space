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
        const res = await fetch(`/api/faith?lang=${encodeURIComponent(language)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('faith api failed')
        const d = await res.json()
        if (mounted && d.text) {
          setVerse(d.text)
          setRef(d.reference || d.ref || '')
        }
      } catch {
        if (mounted) {
          // Fallback now driven by json, not hardcoded
          setVerse(t?.faith?.fallbackVerse || '')
          setRef(t?.faith?.fallbackRef || '')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [language, t])

  return (
    <div className="bg-black/40 rounded-xl p-4 border border-white/10">
      <div className="text-purple-300 text-sm font-bold">
        {t?.faith?.title || t?.faith?.faithOfTheDay}
      </div>
      {loading ? (
        <div className="text-white/50 mt-2 text-sm">
          {t?.common?.loading}
        </div>
      ) : (
        <>
          <div className="text-white mt-2 leading-relaxed">"{verse}"</div>
          <div className="text-yellow-300 text-sm mt-3">{ref}</div>
        </>
      )}
    </div>
  )
}
