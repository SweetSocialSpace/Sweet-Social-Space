import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  if (!lat ||!lng) return NextResponse.json({ zip: '', city: '', error: 'lat/lng required' }, { status: 400 }) // GLOBAL FIX: no 95122 fallback
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { cache: 'no-store' })
    const d = await r.json()
    return NextResponse.json({ zip: d.postcode || '', city: d.city || d.locality || '' }) // GLOBAL FIX: empty, not 95122
  } catch {
    return NextResponse.json({ zip: '', city: '' })
  }
}
