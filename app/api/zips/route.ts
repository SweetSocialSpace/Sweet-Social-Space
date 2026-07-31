import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = (searchParams.get('zip')||'').trim()
  if (!raw || raw.toUpperCase()==='GLOBAL') {
    return NextResponse.json({ zip: raw, city: 'your area', lat: null, lon: null }, { headers: { 'Cache-Control': 'no-store' } })
  }
  const zip = raw.replace(/\s+/g,'')
  try {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      const p = j.places?.[0]
      if (p) return NextResponse.json({ zip, city: `${p['place name']}, ${p['state abbreviation']}`, lat: parseFloat(p.latitude), lon: parseFloat(p.longitude) }, { headers: { 'Cache-Control': 'no-store' } })
    }
  } catch {}
  // fallback - no hard code city, lat/lon null so weather hides instead of --°F lie
  return NextResponse.json({ zip, city: 'your area', lat: null, lon: null }, { headers: { 'Cache-Control': 'no-store' } })
}
