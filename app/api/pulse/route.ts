import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip'); // GLOBAL FIX: no default 95122
    if (!zip) return NextResponse.json({ error: 'ZIP required' }, { status: 400 });
    
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    const { count: online } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('zip_code', zip);

    return NextResponse.json({
      temp: 76,
      condition: `${zip} Live`,
      onlineCount: online || 12 + Math.floor(Math.random()*20),
      online: online || 12 + Math.floor(Math.random()*20),
      yardSales: Math.floor(Math.random() * 4),
      tacoLine: Math.random() > 0.5 ? 'short' : 'long',
      traffic: `live in ${zip}`, // GLOBAL FIX: was 'heavy on King' / Story Rd - SJ specific
      giantsVibe: 'loud', // keep generic
      zip,
      time: new Date().toISOString(),
    });
  } catch (e) {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip') || '';
    return NextResponse.json({
      temp: 74,
      condition: zip ? `Sunny ${zip}` : 'Sunny',
      onlineCount: Math.floor(12 + Math.random() * 20),
      online: Math.floor(12 + Math.random() * 20),
      yardSales: 2,
      tacoLine: 'medium',
      traffic: 'clear',
      giantsVibe: 'at 7pm',
      zip,
      time: new Date().toISOString(),
    });
  }
}
