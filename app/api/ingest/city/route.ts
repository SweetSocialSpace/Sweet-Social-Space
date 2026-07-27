import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip') || '95122';
    if (!zip) return NextResponse.json({ ok: true, seeded: false, reason: 'no zip' });

    const supabase = await createClient() as any;

    // Check recent posts - use created_at, not is_automated (column doesn't exist)
    const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('zip_code', zip)
      .gte('created_at', twoHoursAgo);

    // Only post if quiet - prevents spam
    if (count && count > 0) {
      return NextResponse.json({ ok: true, seeded: false, reason: 'recent post exists', zip, count });
    }

    // Get business name if possible
    let pickName = `${zip} Block`;
    try {
      const { data: biz } = await supabase.from('businesses').select('name').eq('zip_code', zip).limit(5);
      if (biz && biz.length > 0) {
        pickName = biz[Math.floor(Math.random()*biz.length)].name;
      }
    } catch {}

    // INSERT WITH YOUR REAL SCHEMA
    const { error } = await supabase.from('posts').insert({
      body: `📍 ${zip} Live • ${pickName} is open in ${zip} • Support local • Real city data • ${new Date().toLocaleTimeString()}`,
      city: pickName,
      zip_code: zip,
      tag: 'general',
      category: 'general',
      post_type: 'general',
    });

    if (error) {
      console.log('[INGEST CITY] Error:', error.message);
      return NextResponse.json({ ok: true, seeded: false, error: error.message, zip }, { status: 200 });
    }

    return NextResponse.json({ ok: true, seeded: true, zip, business: pickName, time: new Date().toISOString() });
  } catch (e: any) {
    console.log('[INGEST CITY] FAILSAFE:', e?.message);
    return NextResponse.json({ ok: true, seeded: false, failsafe: true, error: e?.message }, { status: 200 });
  }
}
