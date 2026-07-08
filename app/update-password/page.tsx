'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  content: string
  created_at: string
  profiles: { username: string, zip_code: string }
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      const { data } = await supabase
        .from('posts')
        .select('id, content, created_at, profiles(username, zip_code)')
        .order('created_at', { ascending: false })
      
      if (data) setPosts(data as any)
      setLoading(false)
    }
    getData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  setUser(session?.user ?? null)
  router.refresh()
})

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handlePost = async () => {
    if (!content.trim() || !user) return
    
    const { error } = await supabase
      .from('posts')
      .insert({ content: content, user_id: user.id })
    
    if (!error) {
      setContent('')
      router.refresh()
    } else {
      alert(error.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sweet Social Space</h1>
        {user ? (
          <button onClick={handleSignOut} className="text-sm">Sign out</button>
        ) : (
          <button onClick={() => router.push('/login')} className="text-sm">Sign in</button>
        )}
      </div>

      <h2 className="text-xl mb-4">Neighborhood Feed - San Jose</h2>
      
      {user && (
        <div className="mb-6 p-4 border rounded">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your neighborhood?"
            className="w-full p-2 border rounded mb-2"
            maxLength={500}
          />
          <button 
            onClick={handlePost}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Post
          </button>
        </div>
      )}

      {posts.length === 0 ? (
        <p>No posts yet. Be the first.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="mb-4 p-4 border rounded">
            <p className="mb-2">{post.content}</p>
            <p className="text-sm text-gray-500">
              {post.profiles?.username || 'anon'} • {post.profiles?.zip_code || '95122'}
            </p>
          </div>
        ))
      )}
    </main>
  )
}
