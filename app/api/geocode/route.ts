import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  try {
    // GPS MODE — with lat/lng
    if (lat && lng) {
      const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { cache: 'no-store' })
      const d = await r.json()
      return NextResponse.json({ zip: d.postcode || '', city: d.city || d.locality || '', country: d.countryCode || '' })
    }

    // IP MODE — WITHOUT lat/lng — THIS IS WHAT YOU WERE MISSING — GLOBAL
    // 1st provider
    try {
      const r = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' })
      if (r.ok) {
        const d = await r.json()
        if (d.zip || d.city) {
          return NextResponse.json({ zip: d.zip || '', city: d.city || '', country: d.country_code || '', lat: d.latitude, lng: d.longitude })
        }
      }
    } catch {}

    // 2nd provider fallback
    try {
      const r2 = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
      if (r2.ok) {
        const d2 = await r2.json()
        if (d2.postal || d2.city) {
          return NextResponse.json({ zip: d2.postal || '', city: d2.city || '', country: d2.country_code || '' })
        }
      }
    } catch {}

    return NextResponse.json({ zip: '', city: '' })
  } catch {
    return NextResponse.json({ zip: '', city: '' })
  }
}
