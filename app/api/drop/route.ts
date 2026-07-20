import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('name, address, current_deal, deal_address')
      .eq('zip_code', '95122')
      .not('current_deal', 'is', null)
      .gt('deal_expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.current_deal) {
      return NextResponse.json(null, { status: 204 });
    }

    return NextResponse.json({
      business: data.name,
      deal: data.current_deal,
      address: data.deal_address || data.address,
      time: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(null, { status: 204 });
  }
}
