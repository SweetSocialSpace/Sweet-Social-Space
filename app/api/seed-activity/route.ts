// app/api/seed-activity/route.ts - FULLY AUTOMATED
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SEED_POSTS = [
  { category: 'safety', content: 'Heads up 95122: Street sweeping on King Rd tomorrow 8am-12pm - move cars' },
  { category: 'recommend', content: 'Tacos El Jefe line is short right now, just drove by Story & King' },
  { category: 'general', content: 'Anyone hear that fireworks near 101 & Story? 10 mins ago' },
  { category: 'free', content: 'Free lemons from our tree - 1742 Rogers Ave, on the curb' },
]

export async function GET() {
  // Only seed if feed is dead
  const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 6*3600000).toISOString())
  
  if (count !== null && count < 3) {
    const randomPost = SEED_POSTS[Math.floor(Math.random() * SEED_POSTS.length)]
    await supabase.from('posts').insert({
      ...randomPost,
      zip_code: '95122',
      is_automated: true, // Important flag
      author_name: '95122 Pulse Bot',
      expires_at: new Date(Date.now() + 12*3600000).toISOString() // Auto-delete in 12h
    })
  }
  return Response.json({ seeded: true })
}
