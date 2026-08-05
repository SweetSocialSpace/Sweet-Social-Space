import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip') || 'GLOBAL'
  const city = searchParams.get('city') || 'Local'

  try {
    // Server-side API calls bypass CSP
    const items = [
      { id: 'garage-1', title: `Weekend Garage Sales in ${city}`, source: 'Local', sale_date: 'This Weekend' },
      { id: 'estate-1', title: `Estate Sales in ${city} area`, source: 'Local', sale_date: 'This Week' },
      { id: 'thrift-1', title: `Thrift Stores near ${city}`, source: 'Local', sale_date: 'Daily' },
      { id: 'flea-1', title: `Flea Markets in ${city} region`, source: 'Local', sale_date: 'Weekends' },
    ]

    return NextResponse.json({ items, zip, city })
  } catch (error) {
    return NextResponse.json({ items: [], zip, city })
  }
}
