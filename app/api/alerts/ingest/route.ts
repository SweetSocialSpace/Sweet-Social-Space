import { createClient } from '@supabase/supabase-js'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // For production, use a service_role key stored as SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(url, key)

  // TODO: Replace with real feeds – Caltrans, PulsePoint, Nixle, etc.
  // Right now we insert a heartbeat alert so you can SEE the automation working
  const sample = [
    `Local check-in – ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} – Sweet Social Space alert ingestor ran successfully. Wire real feeds in app/api/alerts/ingest/route.ts`
  ]

  let inserted = 0
  for (const body of sample) {
    const { error } = await supabase.from('posts').insert({
      user_id: null,
      body,
      post_type: 'alert',
      is_anonymous: true,
      zip_code: '95122',
      city: 'San Jose, CA',
      source_url: 'https://sweetsocialspace.com/alerts'
    })
    if (!error) inserted++
  }

  return Response.json({ ok: true, inserted, note: 'Automation is working. Replace sample with real local feeds.' })
}
