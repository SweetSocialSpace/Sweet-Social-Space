import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get('zip');
    if (!zip) return new NextResponse(null, { status: 204 });

    const supabase = createClient();

    const { count: total } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('zip_code', zip);
    const { count: verified } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('zip_code', zip).eq('is_verified', true);

    if (!total || total === 0) return new NextResponse(null, { status: 204 });

    const percent = Math.round(((verified || 0) / total) * 100);
    return NextResponse.json({ total, verified: verified || 0, percent, zip, time: new Date().toISOString() });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
