import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // AUTO-MIGRATE - creates columns if missing, no manual SQL
    try {
      // @ts-ignore
      await supabase.rpc('exec_sql', {
        sql_query: `alter table businesses add column if not exists current_deal text`
      });
    } catch {}

    const { data: businesses } = await supabase
     .from('businesses')
     .select('name, address, category')
     .eq('zip_code', '95122')
     .limit(20);

    if (!businesses || businesses.length === 0) return NextResponse.json(null, { status: 204 });

    const dayOfYear = Math.floor(Date.now() / 86400000);
    const todays = businesses[dayOfYear % businesses.length];

    return NextResponse.json({
      business: todays.name,
      deal: `Open in 95122 • ${todays.category || 'Local Spot'}`,
      address: todays.address || '95122',
      isSpotlight: true,
      time: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(null, { status: 204 });
  }
}
