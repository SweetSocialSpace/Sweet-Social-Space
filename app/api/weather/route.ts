import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip') // GLOBAL FIX: no default 95122

  if (!zip) {
    return NextResponse.json({ error: 'ZIP required' }, { status: 400 })
  }

  try {
    const res = await fetch(
     `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
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
