import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip') || 'GLOBAL'
  if (zip === 'GLOBAL') return NextResponse.json({ alerts: [] })
  const { lat, lon } = await fetch(`${req.nextUrl.origin}/api/zips?zip=${zip}`).then(r=>r.json())
  if (!lat) return NextResponse.json({ alerts: [] })

  const [noaa, quakes] = await Promise.all([
    fetch(`https://api.weather.gov/alerts?point=${lat},${lon}`, { next: { revalidate: 300 } }).then(r=>r.json()).catch(()=>null),
    fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=50&minmagnitude=2.0&limit=5`).then(r=>r.json()).catch(()=>null)
  ])
  return NextResponse.json({
    noaa: noaa?.features?.[0]?.properties?.headline || null,
    quake: quakes?.features?.[0]?.properties?.mag? `M${quakes.features[0].properties.mag} quake nearby` : null,
    lastChecked: new Date().toISOString()
  })
}
