export const dynamic = 'force-dynamic'
export const dynamicParams = true

import { createClient } from '@/lib/supabase/server'

type Props = {
  params: { zip: string } | Promise<{ zip: string }>
}

export default async function BlockPage({ params }: Props) {
  // Works for both Next 14 (object) and Next 15 (Promise)
  const resolvedParams = await Promise.resolve(params)
  const raw = resolvedParams?.zip || 'YOUR BLOCK'
  const zipOnly = decodeURIComponent(String(raw)).split(' ')[0].trim()
  const zip = zipOnly || 'YOUR BLOCK'

  const supabase = createClient()
  let posts: any[] = []

  try {
    const { data } = await supabase
     .from('posts')
     .select('id,body,created_at,zip')
     .eq('zip', zip)
     .order('created_at', { ascending: false })
     .limit(20)
    posts = data || []
  } catch {}

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white">Block: {zip}</h1>
      <p className="mt-2 text-white/70">Any zip on earth. Chronological. No algorithm.</p>

      <div className="mt-6">
        {posts.length === 0? (
          <div className="p-8 text-center border border-dashed border-white/30 rounded-2xl bg-black/30">
            <p className="text-white">No posts yet for {zip}.</p>
            <p className="text-white/60 text-sm mt-2">Be first. Own your block.</p>
            <a href={`/feed?zip=${encodeURIComponent(zip)}`} className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full font-bold">
              Post in {zip} →
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
          Enter {zip} Feed →
        </a>
        <a href="/feed" className="border border-white text-white px-6 py-3 rounded-full">
          Change Zip
        </a>
      </div>
    </div>
  )
}
