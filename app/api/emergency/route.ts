import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip') || 'GLOBAL'
  if (zip === 'GLOBAL') return NextResponse.json({ alerts: [] })
  const { lat, lon } = await fetch(`${req.nextUrl.origin}/api/zips?zip=${zip}`).then(r=>r.json())
  if (!lat) return NextResponse.json({ alerts: [] })

  // Use global earthquake API only - US-only NOAA weather API removed for global compatibility
  const quakes = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=50&minmagnitude=2.0&limit=5`).then(r=>r.json()).catch(()=>null)
  
  return NextResponse.json({
    noaa: null, // US-only NOAA API removed for global compatibility
    quake: quakes?.features?.[0]?.properties?.mag? `M${quakes.features[0].properties.mag} quake nearby` : null,
    lastChecked: new Date().toISOString()
  })
}
