import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = (searchParams.get('zip')||'').trim()
  if (!raw || raw.toUpperCase()==='GLOBAL') {
    return NextResponse.json({ zip: raw, city: 'your area', lat: null, lon: null }, { headers: { 'Cache-Control': 'no-store' } })
  }
  const zip = raw.replace(/\s+/g,'')

  // 1. Try global postal search (worldwide zips) - variable, not hard code, no US priority
  try {
    // Comprehensive list of country codes for global zip lookup
    const codes = ['us','ca','gb','de','au','jp','fr','it','es','nl','in','br','mx','ch','at','be','dk','fi','gr','ie','no','pl','pt','se','tr','cz','hu','ro','sk','si','bg','hr','cy','ee','lv','lt','lu','mt','ru','ua','by','kz','uz','kz','kg','tj','tm','am','az','ge','il','jo','lb','sa','ae','qa','kw','bh','om','ye','ir','pk','af','lk','bd','np','in','mm','th','kh','la','vn','my','sg','id','ph','tw','hk','mo','kr','cn','mn','jp','kp','au','nz','fj','pg','sb','vu','nc','pf','ki','tv','nr','mh','fm','pw','mp','gu','as','mp','vi','pr','um','fm','mh','pw','tk','to','ws','nu','ck','pf','wf','as','nz','au']
    for (const c of codes) {
      const r = await fetch(`https://api.zippopotam.us/${c}/${zip}`, { cache: 'no-store' })
      if (r.ok) {
        const j = await r.json()
        const p = j.places?.[0]
        if (p && p.latitude && p.longitude) {
          console.log(`Global zip lookup success: ${zip} -> ${p['place name']}, ${p['state abbreviation'] || p.state || ''} (${p.latitude}, ${p.longitude})`)
          return NextResponse.json({ 
            zip, 
            city: `${p['place name']}, ${p['state abbreviation'] || p.state || ''}`.replace(/, $/,''), 
            lat: parseFloat(p.latitude), 
            lon: parseFloat(p.longitude) 
          }, { headers: { 'Cache-Control': 'no-store' } })
        }
      }
    }
  } catch (error) {
    console.error('Global zip lookup failed:', error)
  }

  // 2. Fallback to Open-Meteo geocoding (more accurate)
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=en&format=json`, { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      const result = j.results?.[0]
      if (result && result.latitude && result.longitude) {
        console.log(`Open-Meteo geocoding success: ${zip} -> ${result.name}, ${result.country} (${result.latitude}, ${result.longitude})`)
        return NextResponse.json({ 
          zip, 
          city: `${result.name}, ${result.country_code || result.country || ''}`, 
          lat: result.latitude, 
          lon: result.longitude 
        }, { headers: { 'Cache-Control': 'no-store' } })
      }
    }
  } catch (error) {
    console.error('Open-Meteo geocoding failed:', error)
  }

  // 3. Last fallback - no hard code city - temp will be null (shows --°F) not lie - per RULES
  console.log(`All zip lookups failed for: ${zip}`)
  return NextResponse.json({ zip, city: 'your area', lat: null, lon: null }, { headers: { 'Cache-Control': 'no-store' } })
}
