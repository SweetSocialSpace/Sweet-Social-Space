import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')
  if (!zip) return NextResponse.json({ error: 'ZIP required' }, { status: 400 })
  const alerts: any[] = []

  // GLOBAL FIX: Geocode ZIP to lat/lng dynamically, not hardcoded 95122
  let lat = 37.3382
  let lon = -121.8413
  try {
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${process.env.OPENWEATHER_API_KEY}`)
    if (geoRes.ok) {
      const g = await geoRes.json()
      lat = g.lat
      lon = g.lon
    }
  } catch {}

  // 1. OpenWeather alerts
  try {
    const owKey = process.env.OPENWEATHER_API_KEY
    if (owKey) {
      const res = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${owKey}`, { next: { revalidate: 300 } })
      if (res.ok) {
        const json = await res.json()
        json.alerts?.forEach((a: any) => {
          alerts.push({
            id: `ow-${a.start}-${a.event}`,
            type: 'Weather',
            icon: '⛈',
            title: a.event,
            message: `${a.description?.slice(0, 180)}...`,
            time: new Date(a.start * 1000).toISOString()
          })
        })
      }
    }
  } catch (e) { console.log('OW fail', e) }

  // 2. NOAA
  try {
    const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
      headers: { 'Accept': 'application/geo+json', 'User-Agent': 'SweetSocialSpace' },
      next: { revalidate: 300 }
    })
    if (res.ok) {
      const json = await res.json()
      json.features?.forEach((f: any) => {
        if (!alerts.find(a => a.title === f.properties?.event)) {
          alerts.push({
            id: f.id,
            type: 'Weather',
            icon: '🚨',
            title: f.properties?.event,
            message: f.properties?.headline,
            time: f.properties?.onset
          })
        }
      })
    }
  } catch {}

  // 3. USGS Earthquakes - GLOBAL: works for any zip now
  try {
    const res = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=50&minmagnitude=2.0&orderby=time&limit=2`, { next: { revalidate: 300 } })
    if (res.ok) {
      const json = await res.json()
      json.features?.forEach((f: any) => {
        const hoursAgo = (Date.now() - f.properties?.time) / 1000 / 3600
        if (hoursAgo < 24) {
          alerts.push({
            id: f.id,
            type: 'Earthquake',
            icon: '🌎',
            title: `M${f.properties?.mag} - ${f.properties?.place}`,
            message: `Felt near ${zip} - ${new Date(f.properties?.time).toLocaleString()}`,
            time: new Date(f.properties?.time).toISOString()
          })
        }
      })
    }
  } catch {}

  if (alerts.length === 0) {
    alerts.push({
      id: 'status-ok',
      type: 'Status',
      icon: '✅',
      title: `All clear in ${zip}`,
      message: `No NOAA alerts, no quakes >2.0 in last 24h, no OpenWeather alerts. Checked ${new Date().toLocaleTimeString()}`,
      time: new Date().toISOString()
    })
  }

  return NextResponse.json({ zip, alerts: alerts.slice(0, 4), count: alerts.length, lat, lon })
}
