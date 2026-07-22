import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zip = searchParams.get('zip') || ''
    
    if (!zip) return NextResponse.json(null, { status: 204 })

    let supabase: any = null;
    try {
      const { createClient } = await import('@/lib/supabase/server');
      supabase = await createClient();
    } catch {
      return NextResponse.json(null, { status: 204 });
    }

    // AUTO-MIGRATE - never crash
    try {
      // @ts-ignore
      await supabase.rpc('exec_sql', {
        sql_query: `alter table businesses add column if not exists current_deal text`
      });
    } catch {}

    try {
      const { data: businesses } = await supabase
       .from('businesses')
       .select('name, address, category')
       .eq('zip_code', zip) // GLOBAL FIX: was '95122'
       .limit(20);

      if (!businesses || businesses.length === 0) {
        return NextResponse.json(null, { status: 204 });
      }

      const dayOfYear = Math.floor(Date.now() / 86400000);
      const todays = businesses[dayOfYear % businesses.length];

      return NextResponse.json({
        business: todays.name,
        deal: `Open in ${zip} • ${todays.category || 'Local Spot'}`, // GLOBAL FIX
        address: todays.address || zip, // GLOBAL FIX
        zip_code: zip,
        isSpotlight: true,
        time: new Date().toISOString()
      });
    } catch {
      return NextResponse.json(null, { status: 204 });
    }
  } catch {
    return NextResponse.json(null, { status: 204 });
  }
}
