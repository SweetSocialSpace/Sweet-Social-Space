import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  // OUTER SHELL - absolutely nothing can 500
  try {
    let supabase: any = null;

    // Try to get client, but don't crash if fails
    try {
      const { createClient } = await import('@/lib/supabase/server');
      supabase = await createClient();
    } catch {
      return NextResponse.json(null, { status: 204 });
    }

    // AUTO-MIGRATE - wrapped so it never crashes main logic
    try {
      // @ts-ignore
      await supabase.rpc('exec_sql', {
        sql_query: `alter table posts add column if not exists location_text text`
      });
    } catch {
      // migration failed - ignore, keep going with real data
    }

    // REAL DATA - count posts last hour
    try {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count, data } = await supabase
       .from('posts')
       .select('id, location_text', { count: 'exact' })
       .eq('zip_code', '95122')
       .gte('created_at', oneHourAgo)
       .limit(5);

      if (!count || count === 0) {
        return NextResponse.json(null, { status: 204 });
      }

      return NextResponse.json({
        count,
        street: data?.[0]?.location_text || '95122',
        time: new Date().toISOString()
      });
    } catch {
      return NextResponse.json(null, { status: 204 });
    }

  } catch {
    // FINAL SAFETY - even if everything else fails
    return NextResponse.json(null, { status: 204 });
  }
}
