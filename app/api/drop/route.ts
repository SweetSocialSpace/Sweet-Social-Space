import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // REAL AUTOMATED - picks one real business from 95122, rotates daily
    const { data: businesses } = await supabase
     .from('businesses')
     .select('name, address, category')
     .eq('zip_code', '95122')
     .limit(20);

    if (!businesses || businesses.length === 0) {
      return NextResponse.json(null, { status: 204 });
    }

    // Rotates automatically by day of year - no cron, no manual
    const dayOfYear = Math.floor(Date.now() / 86400000);
    const todays = businesses[dayOfYear % businesses.length];

    return NextResponse.json({
      business: todays.name,
      deal: `Open in 95122 • ${todays.category || 'Local Spot'}`,
      address: todays.address || '95122',
      isSpotlight: true, // not a deal, just spotlight - honest
      time: new Date().toISOString()
    });
  } catch (e) {
    return NextResponse.json(null, { status: 204 });
  }
}
