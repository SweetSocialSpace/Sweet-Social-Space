import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Try real San Jose 311 open data
    let cityData: any[] = [];
    try {
      const res = await fetch(
        `https://data.sanjoseca.gov/resource/vw2i-c5bq.json?$limit=10&$order=created_date DESC`,
        { cache: 'no-store', next: { revalidate: 0 } }
      );
      if (res.ok) cityData = await res.json();
    } catch {}

    // Filter for 95122 locally if zipcode field exists
    const filtered = cityData.filter((c: any) => 
      !c.zipcode || String(c.zipcode).includes('95122') || String(c.zip || '').includes('95122')
    ).slice(0, 5);

    const toUse = filtered.length > 0 ? filtered : cityData.slice(0, 2);

    let inserted = 0;
    for (const item of toUse) {
      const caseId = String(item.service_request_id || item.sr_number || item.id || Date.now() + Math.random());
      
      const { data: exists } = await supabase
        .from('posts')
        .select('id')
        .eq('external_id', caseId)
        .limit(1);

      if (exists && exists.length > 0) continue;

      const type = item.request_type || item.category || 'City Service';
      const addr = item.address || item.incident_address || '95122';

      await supabase.from('posts').insert({
        content: `🏙️ City of San Jose • ${type} • ${addr} • Status: ${item.status || 'Open'} • #${caseId.slice(0,8)}`,
        zip_code: '95122',
        location_text: addr,
        category: 'city',
        external_id: caseId,
        is_automated: true,
      });
      inserted++;
      if (inserted >= 2) break;
    }

    return NextResponse.json({ ok: true, inserted, fetched: cityData.length });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
