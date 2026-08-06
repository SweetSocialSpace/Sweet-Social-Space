import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawZip = (searchParams.get('zip') || '').trim()
  if (!rawZip || rawZip.toUpperCase() === 'GLOBAL') {
    return NextResponse.json({ city: 'your area', zip: rawZip, country: 'GLOBAL' })
  }
  const zip = rawZip.replace(/\s+/g, '')

  // Try global zip lookup - multiple countries, not US-specific
  const countryCodes = ['us','ca','gb','de','au','jp','fr','it','es','nl','in','br','mx','ch','at','be','dk','fi','gr','ie','no','pl','pt','se','tr','cz','hu','ro','sk','si','bg','hr','cy','ee','lv','lt','lu','mt','ru','ua','by','kz','uz','kz','kg','tj','tm','am','az','ge','il','jo','lb','sa','ae','qa','kw','bh','om','ye','ir','pk','af','lk','bd','np','in','mm','th','kh','la','vn','my','sg','id','ph','tw','hk','mo','kr','cn','mn','jp','kp','au','nz','fj','pg','sb','vu','nc','pf','ki','tv','nr','mh','fm','pw','mp','gu','as','mp','vi','pr','um','fm','mh','pw','tk','to','ws','nu','ck','pf','wf','as','nz','au']
  
  for (const code of countryCodes) {
    try {
      const res = await fetch(`https://api.zippopotam.us/${code}/${zip}`, { next: { revalidate: 3600 } })
      if (res.ok) {
        const data = await res.json()
        const p = data.places?.[0]
        if (p) {
          return NextResponse.json(
            { zip, city: `${p['place name']}, ${p['state abbreviation'] || p.state || ''}`, lat: p.latitude, lon: p.longitude, country: code.toUpperCase() },
            { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
          )
        }
      }
    } catch {}
  }

  // Fallback to Open-Meteo geocoding if zip lookup fails
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=en&format=json`, { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      const result = j.results?.[0]
      if (result && result.latitude && result.longitude) {
        return NextResponse.json({ 
          zip, 
          city: `${result.name}, ${result.country_code || result.country || ''}`, 
          lat: result.latitude, 
          lon: result.longitude,
          country: (result.country_code || '').toUpperCase()
        }, { headers: { 'Cache-Control': 'public, s-maxage=3600' } })
      }
    }
  } catch {}

  // Final fallback - return zip as city variable - works globally, no IP
  return NextResponse.json(
    { zip, city: zip, country: 'GLOBAL', lat: 0, lon: 0 },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  )
}
