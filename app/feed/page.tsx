import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  async function createPost(formData: FormData) {
    'use server'
    const body = formData.get('content') as string
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
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
    revalidatePath('/')
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
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sweet Social Space</h1>
          <form action={logout}>
            <button className="text-sm underline">Logout</button>
          </form>
        </div>
        
        <p className="mb-6">Welcome, {user.email}</p>

        <form action={createPost} className="mb-8 bg-white p-4 rounded-lg shadow">
          <textarea 
            name="content" 
            placeholder="Speak Freely. Love your neighbor."
            className="w-full p-2 border rounded mb-2"
            rows={3}
            required
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">
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
    </div>
  )
}
