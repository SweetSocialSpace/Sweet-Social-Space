import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // REAL - counts actual posts in 95122 in last hour
    const { data, count } = await supabase
     .from('posts')
     .select('id, created_at, location_text, zip_code', { count: 'exact' })
     .eq('zip_code', '95122')
     .gte('created_at', oneHourAgo)
     .limit(5);

    if (!count || count === 0) {
      return NextResponse.json(null, { status: 204 });
    }

    // Get most common location text
    const street = data?.[0]?.location_text || 'near 95122';

    return NextResponse.json({
      count,
      street,
      time: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(null, { status: 204 });
  }
}
