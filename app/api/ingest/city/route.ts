import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawZip = searchParams.get('zip')?.trim();
    const zip = rawZip || 'GLOBAL';
    
    if (!rawZip || rawZip.toUpperCase() === 'GLOBAL') {
      return NextResponse.json({ ok: true, seeded: false, reason: 'no zip - global mode' });
    }

    const supabase = await createClient() as any;

    const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('zip_code', zip)
      .gte('created_at', twoHoursAgo);

    if (count && count > 0) {
      return NextResponse.json({ ok: true, seeded: false, reason: 'recent post exists', zip, count });
    }

    let pickName = zip;
    try {
      const { data: biz } = await supabase.from('businesses').select('name').eq('zip_code', zip).limit(5);
      if (biz && biz.length > 0) {
        pickName = biz[Math.floor(Math.random()*biz.length)].name;
      }
    } catch {}

    const { error } = await supabase.from('posts').insert({
      body: `📍 ${zip} Live • ${pickName} is open • Support local • ${new Date().toLocaleTimeString()}`,
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
    console.log('[INGEST CITY] Error:', e?.message);
    return NextResponse.json({ ok: true, seeded: false, error: e?.message }, { status: 200 });
  }
}
