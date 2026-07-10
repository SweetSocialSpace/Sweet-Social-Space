import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PostForm from './PostForm'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sweet Social Space - San Jose</h1>
      
      <PostForm userId={session.user.id} />
      
      <div className="space-y-4 mt-8">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 bg-white shadow">
              <p className="text-gray-800">{post.body}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(post.created_at).toLocaleString()} • {post.city}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No posts yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}
