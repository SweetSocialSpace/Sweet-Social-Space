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
      `create table if not exists daily_spotlight (id serial primary key, business_id int, date date unique)`
    ];

    for (const sql of migrations) {
      // @ts-ignore - we created exec_sql above
      await supabase.rpc('exec_sql', { sql_query: sql });
    }

    return NextResponse.json({ migrated: true, count: migrations.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
