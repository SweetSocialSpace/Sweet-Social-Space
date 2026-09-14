'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'

// Full Bible book list to rotate through - not just 8 verses
const BIBLE_BOOKS = [
  "Genesis 1:1", "Psalm 23:1", "John 3:16", "Romans 8:28", "Jeremiah 29:11",
  "Philippians 4:13", "Proverbs 3:5", "Isaiah 41:10", "Matthew 11:28",
  "2 Corinthians 5:7", "Psalm 46:10", "Mark 12:31", "James 2:17",
  "Matthew 25:40", "Matthew 5:16", "Galatians 6:2", "Psalm 34:18", "Luke 6:31",
  "John 14:6", "Revelation 21:4", "Psalm 121:2", "1 John 4:19"
]

export default function FaithOfTheDay() {
  const { zip } = useLocation()
  const router = useRouter()
  const { t } = useLanguage()
  const [verse, setVerse] = useState<{text: string, ref: string} | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMore, setShowMore] = useState(false)

  const fetchVerse = async (ref: string) => {
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}`)
      const data = await res.json()
      if (data.text) {
        setVerse({ text: data.text.trim(), ref: data.reference })
      } else {
        setVerse({ text: ref, ref })
      }
    } catch {
      // fallback if API is down
      setVerse({ text: "The Lord is near to the brokenhearted.", ref: "Psalm 34:18" })
    }
    setLoading(false)
  }

  useEffect(() => {
    // Pick verse based on day + hour so it changes throughout the day
    const now = new Date()
    const index = (now.getDate() + now.getHours()) % BIBLE_BOOKS.length
    const dailyRef = BIBLE_BOOKS[index]
    fetchVerse(dailyRef)

    // Auto-rotate every 3 hours for people who stay on the page
    const interval = setInterval(() => {
      const newIndex = (new Date().getHours()) % BIBLE_BOOKS.length
      fetchVerse(BIBLE_BOOKS[newIndex])
    }, 3 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getNewVerse = () => {
    const randomRef = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)]
    setLoading(true)
    fetchVerse(randomRef)
  }

  if (!zip) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10">
        <div className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')}</div>
        <div className="text-white/60 text-xs mt-2">{t('Finding your block...')}</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl" />
      
      {/* CLICKABLE HEADER - goes to deeper search */}
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer hover:opacity-80"
        onClick={() => setShowMore(!showMore)}
      >
        <span className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')} {showMore ? '▲' : '▼'}</span>
        <span className="text- bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs">{t('LIVE')}</span>
      </div>

      {loading ? (
        <div className="text-white/60 text-sm">Loading Word...</div>
      ) : (
        <>
          <div className="text-white font-black text-lg leading-tight">"{verse?.text}"</div>
          <div className="text-yellow-400 font-black text-xs mt-2 tracking-widest">{verse?.ref}</div>
          
          <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/10 cursor-pointer" onClick={() => setShowMore(!showMore)}>
            <div className="text-white/60 text-xs font-black tracking-widest mb-1">{t("TODAY'S THOUGHT:")}</div>
            <div className="text-white text-sm font-bold leading-snug">
              {showMore 
                ? `This is from ${verse?.ref}. Tap to learn how this verse can help you know our Creator and find a way to heaven. Every verse is a step closer.` 
                : "Check on a neighbor today. Tap for deeper study."}
            </div>
          </div>

          {showMore && (
            <div className="mt-3 bg-black/40 rounded-xl p-3 border border-yellow-400/20 animate-in fade-in">
              <div className="text-yellow-400 text-xs font-bold mb-2">Deeper Search:</div>
              <div className="space-y-2">
                <button onClick={() => window.open(`https://www.biblegateway.com/passage/?search=${verse?.ref}&version=NIV`, '_blank')} className="w-full text-left text-white text-xs hover:text-yellow-400">📖 Read full chapter - {verse?.ref}</button>
                <button onClick={() => window.open(`https://www.gotquestions.org/${verse?.ref.replace(' ', '-').toLowerCase()}.html`, '_blank')} className="w-full text-left text-white text-xs hover:text-yellow-400">❓ What does this mean?</button>
                <button onClick={getNewVerse} className="w-full text-left text-white text-xs hover:text-yellow-400">🔄 Get another verse from the Bible</button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={()=> router.push(`/feed?filter=faith`)}
          className="flex-1 bg-white text-black text-xs font-black px-3 py-2 rounded-full text-center hover:bg-yellow-400 transition"
        >
          {t('See Faith Posts →')}
        </button>
        <button
          onClick={getNewVerse}
          className="bg-white/10 text-white text-xs font-black px-3 py-2 rounded-full border border-white/20 hover:bg-white/20"
        >
          {t('Next Verse')}
        </button>
      </div>
    </div>
  )
}
