'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useRouter } from 'next/navigation'

const VERSES = ["Genesis 1:1","Psalm 23:1","John 3:16","Romans 8:28","Jeremiah 29:11","Philippians 4:13","John 14:6","Psalm 46:10","Mark 12:31"]

export default function FaithOfTheDay() {
  const { zip } = useLocation()
  const { t } = useLanguage()
  const router = useRouter()
  const [verse, setVerse] = useState<any>({ text: "Loading Word...", reference: "John 3:16" })
  const [showMore, setShowMore] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadVerse = async (ref: string) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/faith?ref=${encodeURIComponent(ref)}`)
      const data = await r.json()
      setVerse(data)
    } catch {
      setVerse({ text: "For God so loved the world...", reference: ref })
    }
    setLoading(false)
  }

  useEffect(() => {
    const idx = (new Date().getHours() + new Date().getDate()) % VERSES.length
    loadVerse(VERSES[idx])
  }, [])

  if (!zip) {
    return <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10"><div className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')}</div></div>
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl" />

      {/* TAP THIS TO GET MORE INFO - THIS IS THE INTERACTIVE PART YOU WANTED */}
      <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={()=> setShowMore(!showMore)}>
        <span className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')} {showMore? '▲' : '▼'}</span>
        <span className="bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs">TAP FOR MORE</span>
      </div>

      {loading? <div className="text-white/60 text-sm">Loading...</div> : (
        <>
          <div className="text-white font-black text-lg leading-tight cursor-pointer" onClick={()=> setShowMore(!showMore)}>"{verse.text}"</div>
          <div className="text-yellow-400 font-black text-xs mt-2 tracking-widest">{verse.reference}</div>

          {showMore && (
            <div className="mt-4 space-y-3 animate-in fade-in">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="text-yellow-400 text-xs font-black mb-1">GET TO KNOW OUR CREATOR:</div>
                <div className="text-white text-sm">{verse.creator}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="text-yellow-400 text-xs font-black mb-1">WAY TO HEAVEN:</div>
                <div className="text-white text-sm">{verse.heaven}</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-yellow-400/20 space-y-2">
                <button onClick={()=> window.open(`https://www.biblegateway.com/passage/?search=${verse.reference}&version=NIV`, '_blank')} className="w-full text-left text-white text-xs hover:text-yellow-400">📖 Read full chapter - {verse.reference}</button>
                <button onClick={()=> window.open(`https://www.gotquestions.org/search?query=${verse.reference}`, '_blank')} className="w-full text-left text-white text-xs hover:text-yellow-400">❓ What does this verse mean?</button>
                <button onClick={()=> router.push(`/feed?filter=faith&search=${verse.reference}`)} className="w-full text-left text-white text-xs hover:text-yellow-400">🔍 Search more faith posts about this</button>
                <button onClick={()=> { const r = VERSES[Math.floor(Math.random()*VERSES.length)]; loadVerse(r) }} className="w-full text-left text-white text-xs hover:text-yellow-400">🔄 Get another verse from whole Bible</button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={()=> router.push(`/feed?filter=faith`)} className="flex-1 bg-white text-black text-xs font-black px-3 py-2 rounded-full hover:bg-yellow-400">See Faith Posts →</button>
        <button onClick={()=> { const r = VERSES[Math.floor(Math.random()*VERSES.length)]; loadVerse(r); setShowMore(true) }} className="bg-white/10 text-white text-xs font-black px-3 py-2 rounded-full border border-white/20">Next</button>
      </div>
    </div>
  )
}
