import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip');
    if (!zip) return new NextResponse(null, { status: 204 });

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { count: total } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('zip_code', zip); // GLOBAL FIX: was '95122'

    const { count: verified } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('zip_code', zip) // GLOBAL FIX: was '95122'
      .eq('is_verified', true);

    if (!total || total === 0) {
      return new NextResponse(null, { status: 204 });
    }

    const percent = Math.round(((verified || 0) / total) * 100);

    return NextResponse.json({
      total,
      verified: verified || 0,
      percent,
      zip, // GLOBAL: return zip
      time: new Date().toISOString()
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
