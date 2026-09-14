'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useLanguage } from '@/lib/language-context'
import { useRouter } from 'next/navigation'

// 30 verses covering the whole Bible - rotates by hour so it feels like "whole Bible throughout the day"
const FULL_BIBLE = [
  { verse: "In the beginning God created the heavens and the earth.", ref: "Genesis 1:1" },
  { verse: "The Lord is my shepherd, I shall not want.", ref: "Psalm 23:1" },
  { verse: "For God so loved the world that He gave His only begotten Son.", ref: "John 3:16" },
  { verse: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { verse: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5" },
  { verse: "The Lord is near to the brokenhearted.", ref: "Psalm 34:18" },
  { verse: "Love your neighbor as yourself.", ref: "Mark 12:31" },
  { verse: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { verse: "Faith without works is dead.", ref: "James 2:17" },
  { verse: "Let your light shine before others.", ref: "Matthew 5:16" },
  { verse: "I am the way, the truth, and the life.", ref: "John 14:6" },
  { verse: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
  { verse: "Be strong and courageous. Do not be afraid.", ref: "Joshua 1:9" },
  { verse: "Cast all your anxiety on Him because He cares for you.", ref: "1 Peter 5:7" },
  { verse: "And we know that all things work together for good.", ref: "Romans 8:28" },
  { verse: "Come to me, all you who are weary and burdened.", ref: "Matthew 11:28" },
]

export default function FaithOfTheDay() {
  const { zip } = useLocation()
  const { t } = useLanguage()
  const router = useRouter()
  const [today, setToday] = useState(FULL_BIBLE[0])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const hour = new Date().getHours()
    const day = new Date().getDate()
    const idx = (hour + day) % FULL_BIBLE.length
    setToday(FULL_BIBLE[idx])
    setIndex(idx)
  }, [])

  const nextVerse = () => {
    const nextIdx = (index + 1) % FULL_BIBLE.length
    setToday(FULL_BIBLE[nextIdx])
    setIndex(nextIdx)
  }

  if (!zip) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10">
        <div className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')}</div>
        <div className="text-white/60 text-xs mt-2">Finding your block...</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black tracking-widest text-yellow-400">{t('Faith of the Day')}</span>
        <span className="bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs">LIVE</span>
      </div>
      <div className="text-white font-black text-lg leading-tight">"{today.verse}"</div>
      <div className="text-yellow-400 font-black text-xs mt-2 tracking-widest">{today.ref}</div>
      <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/10">
        <div className="text-white/60 text-xs font-black tracking-widest mb-1">TODAY'S THOUGHT:</div>
        <div className="text-white text-sm font-bold leading-snug">Check on a neighbor today - {today.ref} is for {zip}</div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={()=> router.push(`/feed?filter=faith`)} className="flex-1 bg-white text-black text-xs font-black px-3 py-2 rounded-full hover:bg-yellow-400 transition">
          See Faith Posts →
        </button>
        <button onClick={nextVerse} className="bg-white/10 text-white text-xs font-black px-3 py-2 rounded-full border border-white/20 hover:bg-white/20">
          Next Verse
        </button>
      </div>
    </div>
  )
}
