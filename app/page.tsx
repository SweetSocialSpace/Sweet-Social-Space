import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // TODO: Replace with real posts from your database
  const posts = [
    { id: 1, content: 'Welcome to Sweet Social Space. Speak Freely. Love your neighbor.', author: 'Harry', created_at: new Date() }
  ]

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sweet Social Space</h1>
        {user ? (
          <Link href="/feed" className="px-4 py-2 bg-black text-white rounded-lg">
            Go to Feed
          </Link>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-black text-white rounded-lg">
            Log In / Sign Up
          </Link>
        )}
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">Public Feed</h2>
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow mb-4">
            <p className="font-semibold">{post.author}</p>
            <p className="mt-2">{post.content}</p>
          </div>
        ))}
        {!user && (
          <div className="mt-8 text-center p-6 bg-white rounded-lg">
            <p className="text-gray-600">Join the conversation</p>
            <Link href="/login" className="mt-3 inline-block px-6 py-3 bg-black text-white rounded-lg">
              Create Free Account
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
