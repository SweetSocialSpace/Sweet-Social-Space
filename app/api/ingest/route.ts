import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: biz } = await supabase.from('businesses').select('name').eq('zip_code','95122').limit(5);
    if (!biz || biz.length === 0) return NextResponse.json({ ok: false }, { status: 200 });
    const pick = biz[Math.floor(Math.random()*biz.length)];
    await supabase.from('posts').insert({
      content: `📍 95122 Spotlight • ${pick.name} is open in 95122 • Local business`,
      zip_code: '95122',
      location_text: pick.name,
      category: 'recommend',
      is_automated: true,
      external_id: `spot-${Date.now()}`,
    });
    return NextResponse.json({ ok: true, posted: pick.name });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
