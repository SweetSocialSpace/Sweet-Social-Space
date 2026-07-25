import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  try {
    // 1. GPS MODE — lat/lng provided — precise block anywhere in world
    if (lat && lng) {
      const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { cache: 'no-store' })
      const d = await r.json()
      return NextResponse.json({ 
        zip: d.postcode || '', 
        city: d.city || d.locality || '', 
        country: d.countryCode || '',
        lat: Number(lat),
        lng: Number(lng)
      })
    }

    // 2. IP MODE — no lat/lng — first load — get location from IP — GLOBAL
    // Works for London, Mumbai, Tokyo, San Jose — anywhere
    try {
      const r = await fetch('https://ipapi.co/json/', { 
        headers: { 'User-Agent': 'SweetSocialSpace/1.0' },
        cache: 'no-store' 
      })
      if (r.ok) {
        const d = await r.json()
        if (d.postal || d.city) {
          return NextResponse.json({
            zip: d.postal || '',
            city: d.city || '',
            country: d.country_code || '',
            lat: d.latitude || 0,
            lng: d.longitude || 0
          })
        }
      }
    } catch {}

    // 3. Fallback IP provider if ipapi fails
    try {
      const r2 = await fetch('https://api.bigdatacloud.net/data/ip-geolocation?localityLanguage=en&key=', { cache: 'no-store' })
      if (r2.ok) {
        const d2 = await r2.json()
        return NextResponse.json({
          zip: d2.postcode || '',
          city: d2.city || d2.locality || '',
          country: d2.countryCode || '',
          lat: d2.latitude || 0,
          lng: d2.longitude || 0
        })
      }
    } catch {}

    // 4. No hardcode — empty so profile truth can take over
    return NextResponse.json({ zip: '', city: '' })

  } catch {
    return NextResponse.json({ zip: '', city: '' })
  }
}
