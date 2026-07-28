import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // PROTECT - only admin / cron secret can run migrations - not public
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')
    if (secret !== process.env.MIGRATION_SECRET) {
      // Also allow logged-in owner if you want
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'harry@sweetsocialspace.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = createClient()

    const migrations = [
      `alter table businesses add column if not exists current_deal text`,
      `alter table businesses add column if not exists deal_address text`,
      `alter table businesses add column if not exists deal_expires_at timestamptz`,
      `alter table businesses add column if not exists category text`,
      `alter table posts add column if not exists location_text text`,
      `alter table posts add column if not exists source_url text`,
      `alter table posts add column if not exists is_automated boolean default false`,
      `alter table posts add column if not exists external_id text`,
      `create unique index if not exists posts_external_id_unique on posts (external_id) where external_id is not null`,
      `create table if not exists daily_spotlight (id serial primary key, business_id int, date date unique)`,
    ]

    const results: { sql: string; success: boolean; error?: string }[] = []

    for (const sql of migrations) {
      try {
        // @ts-ignore - exec_sql must exist in Supabase as secure definer function
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
        if (error) throw error
        results.push({ sql, success: true })
      } catch (err: any) {
        results.push({ sql, success: false, error: err?.message })
        console.error('Migration failed:', sql, err?.message)
      }
    }

    const failed = results.filter(r => !r.success)

    return NextResponse.json({
      migrated: failed.length === 0,
      count: migrations.length,
      failed: failed.length,
      results,
      date: 'July 28, 2026',
    }, { status: failed.length ? 500 : 200 })

  } catch (e: any) {
    console.error('Migration fatal:', e?.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
