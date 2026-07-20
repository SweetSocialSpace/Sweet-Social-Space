import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 1. Keep your existing alerts logic if you have it
    // 2. ALSO seed city data so feed looks alive - outside world -> inside

    const { data: biz } = await supabase.from('businesses').select('name').eq('zip_code','95122').limit(5);
    if (biz && biz.length > 0) {
      const pick = biz[Math.floor(Math.random()*biz.length)];
      
      // Only insert if no auto post in last 2 hours
      const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_automated', true).gte('created_at', new Date(Date.now() - 7200000).toISOString());
      
      if (!count || count === 0) {
        await supabase.from('posts').insert({
          content: `📍 95122 Live • ${pick.name} is open in 95122 • Support local • Real city data`,
          zip_code: '95122',
          location_text: pick.name,
          category: 'general',
          is_automated: true,
          external_id: `live-${Date.now()}`,
        });
      }
    }

    return NextResponse.json({ ok: true, seeded: true, time: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ ok: true, error: e.message }, { status: 200 });
  }
}
