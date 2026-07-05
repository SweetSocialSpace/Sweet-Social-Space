import { supabaseServer } from '@/lib/supabaseServer'

async function getPosts(postType?: string, zip?: string) {
  const supabase = supabaseServer()
  let q = supabase.from('posts').select('*, profiles(display_name,username)').order('created_at', { ascending: false }).limit(100)
  if (postType) q = q.eq('post_type', postType)
  if (zip) q = q.eq('zip_code', zip)
  const { data } = await q
  return data || []
}

export default async function Feed({ postType, zip }: { postType?: string, zip?: string }) {
  const posts = await getPosts(postType, zip)
  if (posts.length === 0) return <div className="card text-zinc-500">No posts yet. Be the first.</div>
  return (
    <div className="space-y-3">
      {posts.map((p:any) => (
        <div key={p.id} className="card">
          <div className="text-xs text-zinc-500 mb-1">
            {p.is_anonymous || !p.profiles ? 'Neighbor' : (p.profiles.display_name || p.profiles.username || 'Neighbor')}
            {' · '}{p.city} {p.zip_code}
            {' · '}{new Date(p.created_at).toLocaleString()}
            {p.post_type === 'alert' && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">Local Alert</span>}
          </div>
          <div className="whitespace-pre-wrap">{p.body}</div>
          {p.source_url && <a className="text-xs text-blue-700 underline" href={p.source_url} target="_blank">source</a>}
        </div>
      ))}
    </div>
  )
}
