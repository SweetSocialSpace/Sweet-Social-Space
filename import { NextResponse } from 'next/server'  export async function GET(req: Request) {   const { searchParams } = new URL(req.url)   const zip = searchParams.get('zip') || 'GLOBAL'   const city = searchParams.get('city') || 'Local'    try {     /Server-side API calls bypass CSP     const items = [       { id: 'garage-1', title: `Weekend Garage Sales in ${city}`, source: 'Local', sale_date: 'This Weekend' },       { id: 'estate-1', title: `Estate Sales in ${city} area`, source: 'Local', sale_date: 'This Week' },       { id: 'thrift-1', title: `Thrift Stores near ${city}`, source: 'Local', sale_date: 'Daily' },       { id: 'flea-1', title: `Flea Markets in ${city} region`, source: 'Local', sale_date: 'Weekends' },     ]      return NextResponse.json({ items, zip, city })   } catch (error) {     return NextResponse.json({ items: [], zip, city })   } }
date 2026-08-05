import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip') || 'GLOBAL'
  const city = searchParams.get('city') || 'Local'
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  try {
    const events = [
      { id: 'local-1', title: `Community Events in ${city}`, icon: '🏛️', venue: 'Community Center', source: 'Local' },
      { id: 'local-2', title: `Local Sports in ${city}`, icon: '⚽', venue: 'Area Fields', source: 'Local' },
      { id: 'local-3', title: `Arts & Culture in ${city}`, icon: '🎨', venue: 'Local Venues', source: 'Local' },
    ]

    return NextResponse.json({ events, zip, city })
  } catch (error) {
    return NextResponse.json({ events: [], zip, city })
  }
}
