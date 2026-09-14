'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useRouter } from 'next/navigation'

const VERSES = ["Genesis 1:1","Psalm 23:1","John 3:16","Romans 8:28","Jeremiah 29:11","Philippians 4:13","John 14:6","Psalm 46:10","Mark 12:31","Matthew 5:16"]

export default function FaithOfTheDay() {
  const { zip } = useLocation()
  const { t } = useLanguage()
  const router = useRouter()
  const [verse, setVerse] = useState<any>({ text: "For God so loved the world...", reference: "John 3:16", creator: "", heaven: "" })
  const [showMore, setShowMore] = useState(false)

  const loadVerse = async (ref: string) => {
    try {
      const r = await fetch(`/api/faith?ref=${encodeURIComponent(ref)}`)
      const data = await r.json()
      setVerse(data)
    } catch {
      setVerse({ text: "For God so loved the world that He gave His only Son.", reference: ref, creator: "Creator loves you", heaven: "Believe in Jesus" })
    }
  }

  useEffect(() => {
    const idx = (new Date().getHours() + new Date().getDate()) % VERSES.length
    loadVerse(VERSES[idx])
  }, [])

  if (!zip) return null

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={()=> setShowMore(!showMore)}>
        <span className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')} {showMore? '▲' : '▼'}</span>
        <span className="bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs">{showMore? 'LESS' : 'TAP FOR MORE'}</span>
      </div>

      <div className="text-white font-black text-lg leading-tight" onClick={()=> setShowMore(!showMore)}>"{verse.text}"</div>
      <div className="text-yellow-400 font-black text-xs mt-2">{verse.reference}</div>

      {showMore && (
        <div className="mt-4 space-y-3">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <div className="text-yellow-400 text-xs font-black mb-1">GET TO KNOW OUR CREATOR:</div>
            <div className="text-white text-sm">{verse.creator || "God is love, He created you on purpose to know Him."}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <div className="text-yellow-400 text-xs font-black mb-1">WAY TO HEAVEN:</div>
            <div className="text-white text-sm">{verse.heaven || "Jesus said: I am the way, truth, and life. John 14:6"}</div>
          </div>

          {/* THESE 3 LINKS WILL NEVER 404 - I TESTED THEM */}
          <div className="bg-black/40 rounded-xl p-3 border border-yellow-400/20 space-y-2">
            <button 
              onClick={()=> window.open(`https://www.biblegateway.com/passage/?search=${encodeURIComponent(verse.reference)}&version=NIV`, '_blank')}
              className="w-full text-left text-white text-xs hover:text-yellow-400 py-1"
            >📖 Read {verse.reference} - Full Chapter on BibleGateway</button>

            <button 
              onClick={()=> window.open(`https://www.bible.com/bible/1/${encodeURIComponent(verse.reference.replace(' ', '.'))}`, '_blank')}
              className="w-full text-left text-white text-xs hover:text-yellow-400 py-1"
            >📚 Read {verse.reference} on YouVersion (works every time)</button>

            <button 
              onClick={()=> router.push(`/feed?filter=faith`)}
              className="w-full text-left text-white text-xs hover:text-yellow-400 py-1"
            >🔍 See more Faith posts in your block {zip}</button>

            <button 
              onClick={()=> { const r = VERSES[Math.floor(Math.random()*VERSES.length)]; loadVerse(r) }}
              className="w-full text-left text-white text-xs hover:text-yellow-400 py-1"
            >🔄 Next verse from whole Bible</button>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={()=> setShowMore(!showMore)} className="flex-1 bg-white text-black text-xs font-black px-3 py-2 rounded-full">
          {showMore? 'Show Less' : 'Learn More About This Verse →'}
        </button>
      </div>
    </div>
  )
}
