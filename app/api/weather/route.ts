// app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip')
  if (!zip) return NextResponse.json({ temp: null })

  try {
    // 1. Zip -> lat/lon (free, no key)
    const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r=>r.json()).catch(()=>null)
    const lat = geo?.places?.[0]?.latitude
    const lon = geo?.places?.[0]?.longitude
    if (!lat ||!lon) return NextResponse.json({ temp: null })

    // 2. lat/lon -> real weather from internet
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&temperature_unit=fahrenheit`,
      { next: { revalidate: 600 } }
    ).then(r=>r.json())

    return NextResponse.json({
      temp: weather?.current?.temperature_2m,
      source: 'open-meteo'
    })
  } catch (e) {
    return NextResponse.json({ temp: null }, { status: 200 })
  }
}
