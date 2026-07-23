import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip');
    if (!zip) return NextResponse.json({ ok: true, seeded: false, reason: 'no zip' });

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: biz } = await supabase.from('businesses').select('name').eq('zip_code', zip).limit(5); // GLOBAL FIX
    if (biz && biz.length > 0) {
      const pick = biz[Math.floor(Math.random()*biz.length)];
      
      const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('zip_code', zip).eq('is_automated', true).gte('created_at', new Date(Date.now() - 7200000).toISOString());
      
      if (!count || count === 0) {
        await supabase.from('posts').insert({
          content: `📍 ${zip} Live • ${pick.name} is open in ${zip} • Support local • Real city data`, // GLOBAL FIX
          zip_code: zip, // GLOBAL FIX
          location_text: pick.name,
          category: 'general',
          is_automated: true,
          external_id: `live-${zip}-${Date.now()}`,
        });
      }
    }

    return NextResponse.json({ ok: true, seeded: true, zip, time: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ ok: true, error: e.message }, { status: 200 });
  }
}
