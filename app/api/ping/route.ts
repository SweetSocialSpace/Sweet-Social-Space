import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // AUTO-MIGRATE location_text
    try {
      // @ts-ignore
      await supabase.rpc('exec_sql', {
        sql_query: `alter table posts add column if not exists location_text text`
      });
    } catch {}

    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data, count } = await supabase
     .from('posts')
     .select('id, location_text', { count: 'exact' })
     .eq('zip_code', '95122')
     .gte('created_at', oneHourAgo)
     .limit(5);

    if (!count) return NextResponse.json(null, { status: 204 });

    return NextResponse.json({
      count,
      street: data?.[0]?.location_text || '95122',
      time: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(null, { status: 204 });
  }
}
