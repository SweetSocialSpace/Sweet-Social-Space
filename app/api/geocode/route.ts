import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawZip = (searchParams.get('zip') || '').trim()
  if (!rawZip || rawZip.toUpperCase() === 'GLOBAL') {
    return NextResponse.json({ city: 'your area', zip: rawZip, country: 'GLOBAL' })
  }
  const zip = rawZip.replace(/\s+/g, '')

  // Try US first - most users
  try {
    const usRes = await fetch(`https://api.zippopotam.us/us/${zip}`, { next: { revalidate: 3600 } })
    if (usRes.ok) {
      const data = await usRes.json()
      const p = data.places?.[0]
      if (p) {
        return NextResponse.json(
          { zip, city: `${p['place name']}, ${p['state abbreviation']}`, lat: p.latitude, lon: p.longitude, country: 'US' },
          { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
        )
      }
    }
  } catch {}

  // Don't hard code 'id' (Indonesia) - try without country or return variable
  // If US fails, return zip as city variable - works globally, no IP, no Indonesia
  return NextResponse.json(
    { zip, city: zip, country: 'GLOBAL', lat: 0, lon: 0 },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  )
}
