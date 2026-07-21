import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  if (!lat ||!lng) return NextResponse.json({ zip: '95122', city: 'San Jose' })
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { cache: 'no-store' })
    const d = await r.json()
    return NextResponse.json({ zip: d.postcode || '95122', city: d.city || d.locality || 'San Jose' })
  } catch {
    return NextResponse.json({ zip: '95122', city: 'San Jose' })
  }
}
