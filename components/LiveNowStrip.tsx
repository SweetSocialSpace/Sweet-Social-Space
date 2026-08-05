'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LiveNowStrip() {
  const [livePosts, setLivePosts] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Fetch live posts
    const fetchLivePosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('tag', 'live')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) setLivePosts(data)
    }

    fetchLivePosts()

    // Set up real-time subscription for new live posts
    const channel = supabase
      .channel('live-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'tag=eq.live'
        },
        (payload: any) => {
          setLivePosts(prev => [payload.new, ...prev].slice(0, 10))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          setLivePosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (livePosts.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">LIVE</span>
        <span className="text-white font-bold text-sm">Live Now</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {livePosts.map((post) => (
          <div key={post.id} className="bg-white/10 backdrop-blur rounded-lg p-3 min-w-[200px] flex-shrink-0">
            <p className="text-white text-xs line-clamp-2 mb-2">{post.body}</p>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">● LIVE</span>
              <span className="text-white/70 text-xs">
                {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
