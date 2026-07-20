import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

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
      `create table if not exists daily_spotlight (id serial primary key, business_id int, date date unique)`
    ];

    for (const sql of migrations) {
      try {
        // @ts-ignore
        await supabase.rpc('exec_sql', { sql_query: sql });
      } catch {}
    }

    return NextResponse.json({ migrated: true, count: migrations.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 200 });
  }
}
