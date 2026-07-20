import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { count: total } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('zip_code', '95122');

    const { count: verified } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('zip_code', '95122')
      .eq('is_verified', true);

    if (!total || total === 0) {
      return new NextResponse(null, { status: 204 });
    }

    const percent = Math.round(((verified || 0) / total) * 100);

    return NextResponse.json({
      total,
      verified: verified || 0,
      percent,
      time: new Date().toISOString()
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
