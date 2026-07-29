import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawZip = (searchParams.get('zip') || '').trim()
  if (!rawZip || rawZip.toUpperCase() === 'GLOBAL') {
    return NextResponse.json({ city: 'your area', zip: rawZip })
  }
  const zip = rawZip.replace(/\s+/g, '')

  // 1. try US first - global US lookup
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

  // 2. global fallback - try other countries
  try {
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

  // 3. final fallback - global safe - no hardcoat
  return NextResponse.json(
    { zip, city: zip, country: 'GLOBAL' },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  )
}
