import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawZip = (searchParams.get('zip') || '').trim()
  if (!rawZip || rawZip.toUpperCase() === 'GLOBAL') {
    return NextResponse.json({ city: 'your area', zip: rawZip, country: 'GLOBAL' })
  }
  const zip = rawZip.replace(/\s+/g, '')
  try {
    const usRes = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: 'no-store' })
    if (usRes.ok) {
      const data = await usRes.json()
      const p = data.places?.[0]
      if (p) {
        return NextResponse.json(
          { zip, city: `${p['place name']}, ${p['state abbreviation']}`, lat: p.latitude, lon: p.longitude, country: 'US' },
          { headers: { 'Cache-Control': 'no-store' } }
        )
      }
    }
  } catch {}
  // NO hard code San Jose - variable only - works for Tokyo, London, anywhere
  return NextResponse.json(
    { zip, city: 'your area', zip_code: zip, country: 'GLOBAL', lat: 0, lon: 0 },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
