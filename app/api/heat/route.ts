import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const { data } = await supabase
     .from('posts')
     .select('location_text')
     .eq('zip_code', '95122')
     .gte('created_at', startOfDay.toISOString())
     .not('location_text', 'is', null)
     .limit(50);

    if (!data || data.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    // Count streets - all automated, no manual
    const counts: Record<string, number> = {};
    data.forEach((p: any) => {
      const street = (p.location_text || '95122').trim();
      counts[street] = (counts[street] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    const hottest = sorted[0];

    return NextResponse.json({
      street: hottest[0],
      count: hottest[1],
      total: data.length,
      time: new Date().toISOString()
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
