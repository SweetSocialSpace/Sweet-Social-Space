import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = (searchParams.get('zip')||'').trim()
  if (!raw || raw.toUpperCase()==='GLOBAL') {
    return NextResponse.json({ zip: raw, city: 'your area', lat: null, lon: null }, { headers: { 'Cache-Control': 'no-store' } })
  }
  const zip = raw.replace(/\s+/g,'')

  // 1. Try US postal - variable, not hard code
  try {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      const p = j.places?.[0]
      if (p) return NextResponse.json({ 
        zip, 
        city: `${p['place name']}, ${p['state abbreviation']}`, 
        lat: parseFloat(p.latitude), 
        lon: parseFloat(p.longitude) 
      }, { headers: { 'Cache-Control': 'no-store' } })
    }
  } catch {}

  // 2. Try global postal search (worldwide zips) - still variable, not hard code, fixes temp for any zip
  try {
    // Try without country - zippopotam tries to guess
    const codes = ['us','ca','gb','de','au','jp']
    for (const c of codes) {
      const r = await fetch(`https://api.zippopotam.us/${c}/${zip}`, { cache: 'no-store' })
      if (r.ok) {
        const j = await r.json()
        const p = j.places?.[0]
        if (p) return NextResponse.json({ 
          zip, 
          city: `${p['place name']}, ${p['state abbreviation'] || p.state || ''}`.replace(/, $/,''), 
          lat: parseFloat(p.latitude), 
          lon: parseFloat(p.longitude) 
        }, { headers: { 'Cache-Control': 'no-store' } })
      }
    }
  } catch {}

  // 3. Last fallback - no hard code city - temp will be null (shows --°F) not lie - per RULES
  return NextResponse.json({ zip, city: 'your area', lat: null, lon: null }, { headers: { 'Cache-Control': 'no-store' } })
}
