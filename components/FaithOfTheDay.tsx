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
  const [verse, setVerse] = useState<any>({ text: "Loading...", reference: "John 3:16", creator: "", heaven: "", meaning: "" })
  const [showMeaning, setShowMeaning] = useState(false)

  const loadVerse = async (ref: string) => {
    try {
      const r = await fetch(`/api/faith?ref=${encodeURIComponent(ref)}`)
      const data = await r.json()
      setVerse(data)
    } catch {
      setVerse({ text: "For God so loved the world...", reference: ref })
    }
  }

  useEffect(() => {
    const idx = (new Date().getHours() + new Date().getDate()) % VERSES.length
    loadVerse(VERSES[idx])
  }, [])

  if (!zip) return null

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')}</span>
        <span className="bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs">LIVE</span>
      </div>

      <div className="text-white font-black text-lg leading-tight">"{verse.text}"</div>
      <div className="text-yellow-400 font-black text-xs mt-2">{verse.reference}</div>

      <button onClick={() => setShowMeaning(!showMeaning)} className="mt-4 w-full bg-yellow-400 text-black text-sm font-black py-3 rounded-full">
        {showMeaning ? '▲ Hide' : `❓ What does ${verse.reference} mean?`}
      </button>

      {showMeaning && (
        <div className="mt-3 space-y-3">
          <div className="bg-white rounded-xl p-4 border-l-4 border-yellow-400">
            <div className="text-black font-black text-xs mb-1">WHAT IT MEANS:</div>
            <div className="text-black text-sm">{verse.meaning || verse.creator || "God wrote this for you, right here in your block."}</div>
          </div>
          
          {/* THESE 2 LINKS NOW ACTUALLY WORK - TESTED WITH ROMANS 8:28 */}
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={()=> window.open(`https://www.biblegateway.com/passage/?search=${encodeURIComponent(verse.reference)}&version=NIV`, '_blank')}
              className="w-full bg-black/50 text-white text-xs font-bold py-3 rounded-full border border-white/20 hover:bg-white hover:text-black"
            >
              📖 Read {verse.reference} Full Chapter - BibleGateway
            </button>
            <button 
              onClick={()=> window.open(`https://www.bible.com/search/bible?q=${encodeURIComponent(verse.reference)}`, '_blank')}
              className="w-full bg-black/50 text-white text-xs font-bold py-3 rounded-full border border-white/20 hover:bg-white hover:text-black"
            >
              📚 Read {verse.reference} on YouVersion - Search
            </button>
            <button 
              onClick={()=> router.push(`/feed?filter=faith`)}
              className="w-full bg-white/10 text-white text-xs font-bold py-3 rounded-full border border-white/20"
            >
              🔍 More Faith Posts in {zip}
            </button>
          </div>
        </div>
      )}

      <button onClick={()=> { const r = VERSES[Math.floor(Math.random()*VERSES.length)]; loadVerse(r); setShowMeaning(true) }} className="mt-3 w-full bg-white/10 text-white text-xs font-black py-2 rounded-full border border-white/20">
        Next Verse From Whole Bible
      </button>
    </div>
  )
}
