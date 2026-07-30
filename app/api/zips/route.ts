import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip') || 'GLOBAL'
  if (zip === 'GLOBAL') return NextResponse.json({ city: 'your area', lat: null, lon: null })
  const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r=>r.ok?r.json():null).catch(()=>null)
  return NextResponse.json({
    zip,
    city: geo?.places?.[0]?.['place name'] || 'your area',
    state: geo?.places?.[0]?.state || '',
    lat: geo?.places?.[0]?.latitude,
    lon: geo?.places?.[0]?.longitude
  })
}
