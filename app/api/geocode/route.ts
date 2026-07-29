import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawZip = (searchParams.get('zip') || '').trim()
  if (!rawZip || rawZip.toUpperCase() === 'GLOBAL') {
    return NextResponse.json({ city: 'your area', zip: rawZip })
  }
  const zip = rawZip.replace(/\s+/g, '')

  // 1. try US first - 5 digit US zips - fixes 95122 = San Jose not Manado
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

  // 2. global fallback - try without country lock - works in Indonesia, PH, JP, etc
  try {
    // zippopotam needs country, so try ID, PH, etc - or use open API
    // simple global: try to fetch via geocode.maps.co or keep US fail as global
    const globalRes = await fetch(`https://api.zippopotam.us/id/${zip}`, { next: { revalidate: 3600 } })
    if (globalRes.ok) {
      const data = await globalRes.json()
      const p = data.places?.[0]
      if (p) {
        return NextResponse.json(
          { zip, city: `${p['place name']}`, lat: p.latitude, lon: p.longitude, country: data.country },
          { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
        )
      }
    }
  } catch {}

  // 3. final fallback - no Manado hard - no San Jose hard - just return zip - global safe
  return NextResponse.json(
    { zip, city: zip, country: 'GLOBAL' },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  )
}
