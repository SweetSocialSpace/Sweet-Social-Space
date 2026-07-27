import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip');
    if (!zip) return NextResponse.json(null, { status: 204 });

    let supabase: any = null;
    try {
      supabase = createClient();
    } catch {
      return NextResponse.json(null, { status: 204 });
    }

    try {
      // @ts-ignore
      await supabase.rpc('exec_sql', { sql_query: `alter table posts add column if not exists location_text text` });
    } catch {}

    try {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count, data } = await supabase.from('posts').select('id, location_text', { count: 'exact' }).eq('zip_code', zip).gte('created_at', oneHourAgo).limit(5);
      if (!count || count === 0) return NextResponse.json(null, { status: 204 });
      return NextResponse.json({ count, street: data?.[0]?.location_text || zip, zip, time: new Date().toISOString() });
    } catch {
      return NextResponse.json(null, { status: 204 });
    }
  } catch {
    return NextResponse.json(null, { status: 204 });
  }
}
