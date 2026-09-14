'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'

export default function BlockPage() {
  const params = useParams() as { zip?: string }
  const { t, language } = useLanguage()

  const raw = params?.zip || 'YOUR BLOCK'
  const zipOnly = decodeURIComponent(String(raw)).split(' ')[0].trim()
  const zip = zipOnly || 'YOUR BLOCK'

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient()
      try {
        const { data } = await supabase
         .from('posts')
         .select('id,body,created_at,zip')
         .eq('zip', zip)
         .order('created_at', { ascending: false })
         .limit(20)
        setPosts(data || [])
      } catch {}
      setLoading(false)
    }
    fetchPosts()
  }, [zip])

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white">{t('Block:')} {zip}</h1>
      <p className="mt-2 text-white/70">{t('Any zip on earth. Chronological. No algorithm.')}</p>

      <div className="mt-6">
        {loading? (
          <div className="p-8 text-center text-white/50">Loading...</div>
        ) : posts.length === 0? (
          <div className="p-8 text-center border border-dashed border-white/30 rounded-2xl bg-black/30">
            <p className="text-white">{t('No posts yet for')} {zip}.</p>
            <p className="text-white/60 text-sm mt-2">{t('Be first. Own your block.')}</p>
            <a href={`/feed?zip=${encodeURIComponent(zip)}`} className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full font-bold">
              {t('Post in')} {zip} →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p: any) => (
              <div key={p.id} className="p-4 bg-white rounded-xl text-black">{p.body}</div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <a href={`/feed?zip=${encodeURIComponent(zip)}`} className="bg-white text-black px-6 py-3 rounded-full">
          {t('Enter')} {zip} {t('Feed')} →
        </a>
        <a href="/feed" className="border border-white text-white px-6 py-3 rounded-full">
          {t('Change Zip')}
        </a>
      </div>
    </div>
  )
}
