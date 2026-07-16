'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'
import MicRecorder from '@/components/mic/MicRecorder'

export default function FeedPage() {
  const supabase = createClient()
  const [draft, setDraft] = useState('')
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(30)
      if (data) setPosts(data)
    }
    load()
  }, [])

  const submit = async () => {
    if (!draft.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('posts').insert({ user_id: user.id, body: draft, tag: 'General' })
    setDraft('')
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(30)
    if (data) setPosts(data)
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-xl">
          <MicRecorder value={draft} onChange={setDraft} />
          <button onClick={submit} className="mt-4 w-full bg-blue-600 text-white font-black py-3 rounded-full">
            POST
          </button>
        </div>
        {posts.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-4">
            <p className="text-black whitespace-pre-wrap">{p.body}</p>
          </div>
        ))}
      </main>
    </div>
  )
}
