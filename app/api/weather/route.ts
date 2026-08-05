// app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip')
  if (!zip || zip === 'GLOBAL') return NextResponse.json({ temp: null, city: null, description: null })

  try {
    // 1. Zip -> lat/lon via YOUR api/zips (variable, postal lookup, not IP, no hard code)
    const geo = await fetch(`${req.nextUrl.origin}/api/zips?zip=${zip}`, { cache: 'no-store' })
     .then(r=>r.json()).catch(()=>null)

    const lat = geo?.lat || geo?.places?.[0]?.latitude
    const lon = geo?.lon || geo?.places?.[0]?.longitude
    const city = geo?.city || geo?.places?.[0]?.['place name']
    
    if (!lat || !lon) return NextResponse.json({ temp: null, city: city || zip, description: null })

    // 2. lat/lon -> real weather from internet (free, no key, global)
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,
      { cache: 'no-store' }
    ).then(r=>r.json()).catch(()=>null)

    const temp = weather?.current?.temperature_2m ?? null
    const weatherCode = weather?.current?.weather_code ?? null
    
    // Convert WMO code to description
    const getWeatherDescription = (code: number | null) => {
      if (!code) return null
      if (code === 0) return 'Clear sky'
      if (code >= 1 && code <= 3) return 'Partly cloudy'
      if (code >= 45 && code <= 48) return 'Foggy'
      if (code >= 51 && code <= 67) return 'Rainy'
      if (code >= 71 && code <= 77) return 'Snowy'
      if (code >= 80 && code <= 82) return 'Rain showers'
      if (code >= 95) return 'Thunderstorm'
      return 'Cloudy'
    }

    return NextResponse.json({
      temp,
      city: city || zip,
      description: getWeatherDescription(weatherCode),
      zip,
      source: 'postal+open-meteo'
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ temp: null, city: zip, description: null }, { status: 200 })
  }
}
