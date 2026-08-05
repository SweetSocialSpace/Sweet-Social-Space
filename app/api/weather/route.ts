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
    
    console.log(`Weather lookup for ${zip}: lat=${lat}, lon=${lon}, city=${city}`)
    
    if (!lat || !lon) {
      console.log(`Missing coordinates for ${zip}`)
      return NextResponse.json({ temp: null, city: city || zip, description: null })
    }

    // 2. lat/lon -> real weather from internet (free, no key, global)
    // Using Open-Meteo with more parameters for accuracy
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`,
      { cache: 'no-store' }
    ).then(r=>r.json()).catch(()=>null)

    const temp = weather?.current?.temperature_2m ?? null
    const humidity = weather?.current?.relative_humidity_2m ?? null
    const weatherCode = weather?.current?.weather_code ?? null
    const windSpeed = weather?.current?.wind_speed_10m ?? null
    
    console.log(`Weather data for ${zip}: temp=${temp}, code=${weatherCode}`)
    
    // Convert WMO code to description
    const getWeatherDescription = (code: number | null) => {
      if (!code) return null
      if (code === 0) return 'Clear sky'
      if (code >= 1 && code <= 3) return 'Partly cloudy'
      if (code >= 45 && code <= 48) return 'Foggy'
      if (code >= 51 && code <= 55) return 'Light drizzle'
      if (code >= 61 && code <= 65) return 'Rain'
      if (code >= 66 && code <= 67) return 'Freezing rain'
      if (code >= 71 && code <= 77) return 'Snow'
      if (code >= 80 && code <= 82) return 'Rain showers'
      if (code >= 85 && code <= 86) return 'Snow showers'
      if (code >= 95) return 'Thunderstorm'
      if (code >= 96 && code <= 99) return 'Thunderstorm with hail'
      return 'Cloudy'
    }

    return NextResponse.json({
      temp,
      humidity,
      windSpeed,
      city: city || zip,
      description: getWeatherDescription(weatherCode),
      zip,
      lat,
      lon,
      source: 'postal+open-meteo'
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ temp: null, city: zip, description: null }, { status: 200 })
  }
}
