import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  try {
    // 1. If we have lat/lng - reverse geocode to zip
    if (lat && lng) {
      try {
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { cache: 'no-store', next: { revalidate: 0 } })
        if (r.ok) {
          const d = await r.json()
          return NextResponse.json({ 
            zip: d.postcode || '', 
            postcode: d.postcode || '', 
            city: d.city || d.locality || '', 
            country: d.countryCode || d.countryName || '',
            lat, lng 
          })
        }
      } catch {}
    }

    // 2. IP -> location - try unblocked providers first
    try {
      const r = await fetch('https://ipwho.is/', { cache: 'no-store', next: { revalidate: 0 } })
      if (r.ok) {
        const d = await r.json()
        if (d.success !== false && (d.postal || d.city)) {
          return NextResponse.json({ 
            zip: d.postal || '', 
            postcode: d.postal || '', 
            city: d.city || '', 
            country: d.country_code || '',
            lat: d.latitude, lng: d.longitude
          })
        }
      }
    } catch {}

    try {
      const r = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store', next: { revalidate: 0 } })
      if (r.ok) {
        const d = await r.json()
        if (d.zip || d.city) {
          return NextResponse.json({ 
            zip: d.zip || '', 
            postcode: d.zip || '', 
            city: d.city || '', 
            country: d.country_code || '',
            lat: d.latitude, lng: d.longitude
          })
        }
      }
    } catch {}

    return NextResponse.json({ zip: '', city: '', country: '' })
  } catch (e) {
    return NextResponse.json({ zip: '', city: '', country: '' })
  }
}
