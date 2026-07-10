import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PostForm from './PostForm'
import PostList from './PostList'

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
      
      <PostList posts={posts || []} />
    </div>
  )
}
