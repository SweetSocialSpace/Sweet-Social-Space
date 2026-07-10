import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sweet Social Space</h1>
          {user ? (
            <Link href="/feed" className="bg-black text-white px-4 py-2 rounded">Go to Feed</Link>
          ) : (
            <Link href="/login" className="bg-black text-white px-4 py-2 rounded">Log In / Sign Up</Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-8">
        <h2 className="text-xl font-semibold mb-2">Public Feed</h2>
        <p className="text-gray-600 mb-8">Welcome to Sweet Social Space. Speak Freely. Love your neighbor.</p>
        
        <div className="space-y-4">
          {posts?.length ? posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow">
              <p>{post.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          )) : (
            <p className="text-gray-500">No posts yet. Be the first to speak freely.</p>
          )}
        </div>
      </main>

      <footer className="max-w-4xl mx-auto p-8 text-center text-sm text-gray-500">
        <Link href="/privacy" className="hover:underline mr-4">Privacy</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  )
}
