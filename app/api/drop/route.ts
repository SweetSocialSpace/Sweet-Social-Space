import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // REAL - pulls one random business that has a deal in 95122
    const { data } = await supabase
      .from('businesses')
      .select('name, address, current_deal, category')
      .eq('zip_code', '95122')
      .not('current_deal', 'is', null)
      .limit(1)
      .single();

    if (!data) {
      // If no real deal today, return NOTHING - don't fake it
      return NextResponse.json(null, { status: 204 });
    }

    return NextResponse.json({
      business: data.name,
      deal: data.current_deal,
      address: data.address,
      time: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(null, { status: 204 });
  }
}
