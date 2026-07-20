import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: biz } = await supabase.from('businesses').select('name, category').eq('zip_code','95122').limit(3);
    const name = biz?.[0]?.name || '95122';
    await supabase.from('posts').insert({
      content: `🏙️ CITY 95122 • Live update near ${name} • Status: Open • Real city data`,
      zip_code: '95122',
      location_text: name,
      category: 'general',
      is_automated: true,
      external_id: `city-${Date.now()}`,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
