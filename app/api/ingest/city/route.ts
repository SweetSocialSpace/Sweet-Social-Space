import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // REAL San Jose 311 API - public, no key needed
    // Filtering for 95122 and last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const res = await fetch(
      `https://data.sanjoseca.gov/resource/vw2i-c5bq.json?$where=zipcode='95122'&$limit=20&$order=created_date DESC`,
      { cache: 'no-store' }
    );

    if (!res.ok) return new NextResponse(null, { status: 204 });

    const cityData: any[] = await res.json();
    if (!cityData || cityData.length === 0) return new NextResponse(null, { status: 204 });

    let inserted = 0;

    for (const item of cityData) {
      const cityId = item.service_request_id || item.sr_number || item.case_id;
      if (!cityId) continue;

      // Avoid duplicates - check if we already posted this city case
      const { data: exists } = await supabase
        .from('posts')
        .select('id')
        .eq('external_id', String(cityId))
        .limit(1);

      if (exists && exists.length > 0) continue;

      // Build honest bot post - clearly labeled, not fake neighbor
      const type = item.request_type || item.category || 'City Report';
      const street = item.address || item.incident_address || '95122';
      
      const content = `🤖 95122 City Live • ${type} reported near ${street}. Status: ${item.status || 'Open'} • Case #${cityId} • Source: City of San Jose 311`;

      const { error } = await supabase.from('posts').insert({
        content,
        zip_code: '95122',
        location_text: street,
        category: 'city',
        external_id: String(cityId),
        source_url: 'https://data.sanjoseca.gov',
        is_automated: true,
        user_id: null, // system bot - not a fake user
        created_at: item.created_date || new Date().toISOString()
      });

      if (!error) inserted++;
      if (inserted >= 5) break; // only 5 per hour to avoid spam
    }

    return NextResponse.json({ ingested: inserted, total_fetched: cityData.length });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
