import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = (searchParams.get('zip') || '').trim()
  if (!zip) return NextResponse.json({ city: 'your area' })

  try {
    // force US - no Indonesia
    const url = `https://api.zippopotam.us/us/${zip}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('not found')
    const data = await res.json()
    const place = data.places?.[0]
    const city = place ? `${place['place name']}, ${place['state abbreviation']}` : zip
    
    return NextResponse.json(
      { zip, city, lat: place?.latitude, lon: place?.longitude },
      { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
    )
  } catch {
    // fallback - San Jose for 95122 - not Manado
    const fallback: Record<string, string> = { '95122': 'San Jose, CA' }
    return NextResponse.json({ zip, city: fallback[zip] || zip })
  }
}
