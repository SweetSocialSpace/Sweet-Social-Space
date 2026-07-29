import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')?.trim()

  if (!zip) {
    return NextResponse.json({ error: 'zip required - global' }, { status: 400 })
  }

  try {
    // GLOBAL - supports any country postal code
    const query = encodeURIComponent(zip)
    const res = await fetch(
     `https://api.openweathermap.org/data/2.5/weather?zip=${query}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`,
     { next: { revalidate: 300 } }
    )

    if (!res.ok) throw new Error('Weather fetch failed')

    const data = await res.json()

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      zip
    })

  } catch (error) {
    return NextResponse.json({ error: 'Could not fetch weather' }, { status: 500 })
  }
}
