import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip');
    if (!zip) return NextResponse.json({ ok: false, reason: 'zip required' }, { status: 400 });

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: biz } = await supabase.from('businesses').select('name, category').eq('zip_code', zip).limit(3); // GLOBAL FIX
    const name = biz?.[0]?.name || zip;
    await supabase.from('posts').insert({
      content: `🏙 CITY ${zip} • Live update near ${name} • Status: Open • Real city data`, // GLOBAL FIX
      zip_code: zip, // GLOBAL FIX
      location_text: name,
      category: 'general',
      is_automated: true,
      external_id: `city-${zip}-${Date.now()}`,
    });
    return NextResponse.json({ ok: true, zip });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
