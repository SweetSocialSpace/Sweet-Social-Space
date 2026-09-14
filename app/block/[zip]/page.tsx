// app/block/[zip]/page.tsx - works for ANY zip on earth
import { createClient } from '@/lib/supabase/server'

export default async function BlockPage({ params }: { params: { zip: string } }) {
  // Keep as string! 01000 != 1000
  const rawZip = params.zip || 'YOUR BLOCK'
  const zip = decodeURIComponent(rawZip).trim()
  const isGeneric = !zip || zip.toUpperCase() === 'YOUR BLOCK' || zip.length < 3

  const supabase = createClient()

  // Try to get posts for this zip - but don't 404 if none
  let posts: any[] = []
  let count = 0
  
  if (!isGeneric) {
    const { data, count: c } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('zip', zip)
      .order('created_at', { ascending: false })
      .limit(20)
    
    posts = data || []
    count = c || 0
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white">
        {isGeneric ? 'YOUR BLOCK Has A Feed' : `Block: ${zip}`}
      </h1>
      
      <p className="mt-2 text-white/70">
        {isGeneric 
          ? 'Built for any zip on earth. Enter your zip to see your block.'
          : `${count} posts near ${zip} • Chronological • No algorithm`
        }
      </p>

      {isGeneric ? (
        <div className="mt-8 p-6 border border-white/20 rounded-2xl bg-white/5">
          <p className="text-white">✓ Chronological feed by zip/radius</p>
          <p className="text-white">✓ BlockMap auto-loads your area</p>
          <p className="text-white">✓ LivePulse + AI Mayor automated by zip</p>
          <p className="text-white">✓ Speak Freely / Faith Corner / OwnThisBlock</p>
          <p className="text-sm text-white/50 mt-4">Works for ANY zip on earth.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {posts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl">
              <p className="text-white">No posts yet for {zip}.</p>
              <p className="text-white/60 text-sm mt-1">Be the first to post on your block.</p>
              <a href={`/feed?zip=${zip}`} className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full">
                Post in {zip} →
              </a>
            </div>
          ) : (
            posts.map((p: any) => (
              <div key={p.id} className="p-4 bg-white rounded-xl text-black">
                {p.body}
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <a href={`/feed?zip=${zip}`} className="bg-white text-black px-6 py-3 rounded-full">
          Enter {zip} Feed →
        </a>
        <a href="/feed" className="border border-white text-white px-6 py-3 rounded-full">
          Change Zip
        </a>
      </div>

      <p className="mt-8 text-xs text-white/40">
        Own your code. Own your speech. Open source. Supabase Auth. Next.js 14.
      </p>
    </div>
  )
}

// IMPORTANT: Tell Next.js this route is dynamic for ANY zip
export const dynamic = 'force-dynamic'
export const dynamicParams = true // allow any zip, not just pre-generated
