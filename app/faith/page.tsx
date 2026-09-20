'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import Link from 'next/link'
import FaithOfTheDay from '@/components/FaithOfTheDay'

const VERSES = [
  { verse: "Love your neighbor as yourself.", ref: "Mark 12:31", prompt: "Who on your block can you show love to today?" },
  { verse: "Faith without works is dead.", ref: "James 2:17", prompt: "Is there a neighbor nearby who needs a hand?" },
  { verse: "Be still, and know that I am God.", ref: "Psalm 46:10", prompt: "Take 30 seconds before you scroll. Breathe." },
  { verse: "What you do to the least of these, you do to me.", ref: "Matthew 25:40", prompt: "That free couch? Someone's blessing." },
  { verse: "Let your light shine before others.", ref: "Matthew 5:16", prompt: "Post one encouragement to your block today." },
  { verse: "Bear one another's burdens.", ref: "Galatians 6:2", prompt: "Someone near you is carrying something heavy." },
  { verse: "The Lord is near to the brokenhearted.", ref: "Psalm 34:18", prompt: "Check on a neighbor today." },
  { verse: "Do unto others as you would have them do unto you.", ref: "Luke 6:31", prompt: "WWJD on your block today?" },
]

export default function FaithPage() {
  const { zip, city } = useLocation()
  const [faithPosts, setFaithPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const displayArea = city || zip || 'your area'

  useEffect(() => {
    if (!zip) return
    const loadFaithPosts = async () => {
      try {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('zip_code', zip)
          .or('tag.eq.faith,category.eq.faith')
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (data) setFaithPosts(data)
      } catch (e) {
        console.log('Faith posts error:', e)
      } finally {
        setLoading(false)
      }
    }
    loadFaithPosts()
  }, [zip])

  const today = VERSES[new Date().getDate() % VERSES.length]

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Faith Corner</h1>
        <p className="text-white/60">Community faith and encouragement for {displayArea}</p>
      </div>

      <div className="space-y-6">
        {/* Faith of the Day */}
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black tracking-widest text-yellow-400">Faith of the Day</span>
              <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-xs">Daily</span>
            </div>
            <div className="text-white font-black text-2xl leading-tight mb-3">"{today.verse}"</div>
            <div className="text-yellow-400 font-black text-sm tracking-widest mb-4">{today.ref}</div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-xs font-black tracking-widest mb-2">TODAY'S THOUGHT:</div>
              <div className="text-white text-base font-bold leading-snug">{today.prompt}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href="/feed?filter=faith"
                className="flex-1 bg-white text-black text-sm font-black px-4 py-2 rounded-full text-center hover:bg-yellow-400 transition"
              >
                See Faith Posts →
              </Link>
              <button
                onClick={()=> {
                  if(typeof navigator!== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(`"${today.verse}" - ${today.ref} - from Sweet Social Space`)
                  }
                }}
                className="bg-white/10 text-white text-sm font-black px-4 py-2 rounded-full border border-white/20"
              >
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Community Faith Posts */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">Community Faith Posts</h2>
          {loading ? (
            <p className="text-white/60">Loading faith posts...</p>
          ) : faithPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60 mb-4">No faith posts yet in {displayArea}</p>
              <Link
                href="/feed"
                className="inline-block bg-white text-black px-6 py-2 rounded-full font-black text-sm hover:bg-yellow-400 transition"
              >
                Post Something →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {faithPosts.map((post) => (
                <div key={post.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white text-sm leading-relaxed">{post.body}</p>
                  <div className="mt-2 text-xs text-white/40">
                    {new Date(post.created_at).toLocaleString()} • {post.zip_code}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What This Is */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">What This Is</h2>
          <div className="space-y-3 text-white/70 text-sm">
            <p><strong>🙏 Faith Corner:</strong> A space for your local community to share encouragement, prayer requests, and faith-based discussions.</p>
            <p><strong>🏘️ Local Focus:</strong> Content is specific to your 5-20 mile radius - your actual neighbors, not the whole internet.</p>
            <p><strong>💬 Open to All:</strong> Whether you're deeply religious or just curious, this is a welcoming space for respectful dialogue.</p>
            <p><strong>🤝 Supportive Community:</strong> Neighbors helping neighbors through faith, encouragement, and practical assistance.</p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">Community Guidelines</h2>
          <div className="space-y-2 text-white/70 text-sm">
            <p>• Be respectful of different faith traditions and beliefs</p>
            <p>• Use this space to encourage and support your neighbors</p>
            <p>• Share prayer requests and offers to help</p>
            <p>• No proselytizing or condemning others' beliefs</p>
            <p>• Keep discussions local and relevant to your community</p>
          </div>
        </div>
      </div>
    </div>
  )
}
