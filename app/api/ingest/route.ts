import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Don't spam - only 1 per hour
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('is_automated', true)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    if (count && count > 0) {
      return NextResponse.json({ skipped: 'already posted this hour' });
    }

    // Pull from your REAL businesses table to make feed look alive
    const { data: biz } = await supabase
      .from('businesses')
      .select('name, category')
      .eq('zip_code', '95122')
      .limit(10);

    if (!biz || biz.length === 0) return new NextResponse(null, { status: 204 });

    const pick = biz[Math.floor(Math.random() * biz.length)];

    await supabase.from('posts').insert({
      content: `📍 Local Spotlight • ${pick.name} in 95122 • ${pick.category || 'Local business'} • Supporting 95122`,
      zip_code: '95122',
      location_text: pick.name,
      category: 'recommend',
      is_automated: true,
      external_id: `biz-${Date.now()}`,
    });

    return NextResponse.json({ ok: true, spotlight: pick.name });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
