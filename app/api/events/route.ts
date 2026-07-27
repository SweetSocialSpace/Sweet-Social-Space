import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 37.3351 // GLOBAL: San Jose default, not Austin
  const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : -121.8932 // GLOBAL
  const city = searchParams.get('city') || 'Local'
  const zip = searchParams.get('zip') || '95122' // GLOBAL FIX: was 'local'
  const events: any[] = []

  try {
    const res = await fetch(`https://api.seatgeek.com/2/events?lat=${lat}&lon=${lon}&range=15mi&per_page=6&sort=score.desc`, { next: { revalidate: 1800 } })
    if (res.ok) {
      const json = await res.json()
      json.events?.forEach((e: any) => {
        events.push({
          id: `sg-${e.id}`,
          title: e.title,
          type: e.type?.replace('_',' ') || 'Event',
          venue: e.venue?.name,
          time: e.datetime_local,
          url: e.url,
          icon: e.type === 'concert'? '🎤' : e.type?.includes('sport')? '⚾' : '🎉'
        })
      })
    }
  } catch {}

  if (events.length === 0) {
    events.push(
      { id: '1', title: `Live Music near ${zip}`, type: 'Concert', venue: `${city} Live`, time: new Date().toISOString(), icon: '🎸' },
      { id: '2', title: `Local Market near ${zip}`, type: 'Market', venue: `${city} Market`, time: new Date().toISOString(), icon: '🛍' },
      { id: '3', title: `Community Event`, type: 'Community', venue: city, time: new Date().toISOString(), icon: '🎉' },
    )
  }

  return NextResponse.json({ events: events.slice(0,5), zip, lat, lon })
}
