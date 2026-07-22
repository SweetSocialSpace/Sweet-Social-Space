'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useRouter } from 'next/navigation'

const VERSES = [
  { verse: "Love your neighbor as yourself.", ref: "Mark 12:31", prompt: "Who on your block can you show love to today?" },
  { verse: "Faith without works is dead.", ref: "James 2:17", prompt: "Is there a neighbor within 5 miles who needs a hand?" },
  { verse: "Be still, and know that I am God.", ref: "Psalm 46:10", prompt: "Take 30 seconds before you scroll. Breathe." },
  { verse: "What you do to the least of these, you do to me.", ref: "Matthew 25:40", prompt: "That free couch? Someone's blessing." },
  { verse: "Let your light shine before others.", ref: "Matthew 5:16", prompt: "Post one encouragement to your block today." },
  { verse: "Bear one another's burdens.", ref: "Galatians 6:2", prompt: "Someone near you is carrying something heavy." },
  { verse: "The Lord is near to the brokenhearted.", ref: "Psalm 34:18", prompt: "Check on a neighbor today." },
  { verse: "Do unto others as you would have them do unto you.", ref: "Luke 6:31", prompt: "WWJD on your block today?" },
]

export default function FaithOfTheDay() {
  const { zip } = useLocation()
  const router = useRouter()
  const [today, setToday] = useState(VERSES[0])

  useEffect(() => {
    const dayIndex = new Date().getDate() % VERSES.length
    setToday(VERSES[dayIndex])
  }, [])

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black tracking-widest text-yellow-400">✝️ FAITH OF THE DAY</span>
        <span className="text- font-black bg-white/10 text-white px-2 py-1 rounded-full">📍 {zip || 'YOUR BLOCK'}</span>
      </div>
      <div className="text-white font-black text-lg leading-tight">"{today.verse}"</div>
      <div className="text-yellow-400 font-black text-xs mt-2 tracking-widest">{today.ref}</div>
      <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/10">
        <div className="text-white/60 text- font-black tracking-widest mb-1">TODAY'S THOUGHT:</div>
        <div className="text-white text-sm font-bold leading-snug">{today.prompt}</div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={()=>router.push('/feed?filter=faith')} className="flex-1 bg-white text-black text-xs font-black px-3 py-2 rounded-full text-center hover:bg-yellow-400 transition">See Faith Posts →</button>
        <button onClick={() => navigator.clipboard.writeText(`"${today.verse}" - ${today.ref} - from Sweet Social Space`)} className="bg-white/10 text-white text-xs font-black px-3 py-2 rounded-full border border-white/20">Share</button>
      </div>
    </div>
  )
}
