import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export default async function Feed() {
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

  const { data: { user } } = await supabase.auth.getUser()
  
  // THIS LINE FORCES LOGIN - nobody sees feed without account
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  async function createPost(formData: FormData) {
    'use server'
    
    const body = formData.get('body') as string
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !body.trim()) return

    const { error } = await supabase.from('posts').insert({
      body: body.trim(),
      user_id: user.id,
      post_type: 'neighborhood',
      is_anonymous: false,
      city: 'San Jose, CA',
      zip_code: '95122'
    })

    if (error) console.log('Post insert error:', error)
    revalidatePath('/feed')
  }

  async function logout() {
    'use server'
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
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sweet Social Space</h1>
        <form action={logout}>
          <button type="submit" className="underline">Logout</button>
        </form>
      </div>
      
      <p className="mb-4">Welcome, {user.email}</p>

      <form action={createPost} className="mb-6" key={posts?.length}>
        <textarea
          name="body"
          placeholder="What's happening in San Jose?"
          className="w-full p-2 border rounded"
          rows={3}
        />
        <button 
          type="submit" 
          className="mt-2 bg-black text-white px-4 py-2 rounded"
        >
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts?.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow">
            <p>{post.body}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
