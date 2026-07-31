// app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip')
  if (!zip || zip === 'GLOBAL') return NextResponse.json({ temp: null })

  try {
    // 1. Zip -> lat/lon via YOUR api/zips (variable, postal lookup, not IP, no hard code)
    const geo = await fetch(`${req.nextUrl.origin}/api/zips?zip=${zip}`, { next: { revalidate: 3600 } })
     .then(r=>r.json()).catch(()=>null)

    const lat = geo?.lat || geo?.places?.[0]?.latitude
    const lon = geo?.lon || geo?.lon || geo?.places?.[0]?.longitude
    if (!lat ||!lon) return NextResponse.json({ temp: null })

    // 2. lat/lon -> real weather from internet (free, no key, global)
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&temperature_unit=fahrenheit`,
      { next: { revalidate: 600 } }
    ).then(r=>r.json()).catch(()=>null)

    return NextResponse.json({
      temp: weather?.current?.temperature_2m?? null,
      zip,
      source: 'postal+open-meteo'
    })
  } catch {
    return NextResponse.json({ temp: null }, { status: 200 })
  }
}
