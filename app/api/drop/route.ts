import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { bboxForRadius, SCOPE_RADIUS_MILES, milesBetween, type LocationFilter } from '@/lib/location-scope'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip')?.trim()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const scope = searchParams.get('scope') as '5mi' | '10mi' | '15mi' | '20mi' || '10mi'
  
  if (!zip) return NextResponse.json({ drop: null })

  const supabase = createClient()
  
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)

  let drop: any = null

  // Use radius-based filtering if coordinates provided
  if (lat && lng) {
    const radiusMiles = SCOPE_RADIUS_MILES[scope] || 10
    const bbox = bboxForRadius(parseFloat(lat), parseFloat(lng), radiusMiles)
    
    const { data: drops } = await supabase
      .from('drops')
      .select('*')
      .gte('starts_at', todayStart.toISOString())
      .gte('latitude', bbox.minLat)
      .lte('latitude', bbox.maxLat)
      .gte('longitude', bbox.minLng)
      .lte('longitude', bbox.maxLng)
      .order('is_sponsored', { ascending: false })
      .order('starts_at', { ascending: false })
      .limit(5)
    
    if (drops && drops.length > 0) {
      // Find the closest drop
      const filter: LocationFilter = { scope, lat: parseFloat(lat), lng: parseFloat(lng) }
      
      let closest = drops[0]
      let closestDist = Infinity
      
      for (const d of drops) {
        if (d.latitude && d.longitude) {
          const dist = milesBetween(filter.lat!, filter.lng!, d.latitude, d.longitude)
          if (dist < closestDist && dist <= radiusMiles) {
            closestDist = dist
            closest = d
          }
        }
      }
      
      if (closestDist <= radiusMiles) {
        drop = closest
      }
    }
    
    if (!drop) {
      const { data: oldDrops } = await supabase
        .from('drops')
        .select('*')
        .gte('latitude', bbox.minLat)
        .lte('latitude', bbox.maxLat)
        .gte('longitude', bbox.minLng)
        .lte('longitude', bbox.maxLng)
        .order('starts_at', { ascending: false })
        .limit(5)
      
      if (oldDrops && oldDrops.length > 0) {
        const filter: LocationFilter = { scope, lat: parseFloat(lat), lng: parseFloat(lng) }
        
        let closest = oldDrops[0]
        let closestDist = Infinity
        
        for (const d of oldDrops) {
          if (d.latitude && d.longitude) {
            const dist = milesBetween(filter.lat!, filter.lng!, d.latitude, d.longitude)
            if (dist < closestDist && dist <= radiusMiles) {
              closestDist = dist
              closest = d
            }
          }
        }
        
        if (closestDist <= radiusMiles) {
          drop = closest
        }
      }
    }
  } else {
    // Fallback to zip-based filtering
    let { data: zipDrop } = await supabase
      .from('drops')
      .select('*')
      .eq('zip_code', zip)
      .gte('starts_at', todayStart.toISOString())
      .order('is_sponsored', { ascending: false })
      .order('starts_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!zipDrop) {
      const res = await supabase
        .from('drops')
        .select('*')
        .eq('zip_code', zip)
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      drop = res.data
    } else {
      drop = zipDrop
    }
  }

  return NextResponse.json({ drop })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { zip_code, title, description, business_name, claim_url, price_paid } = body
  if (!zip_code || !title) return NextResponse.json({ error: 'Missing' }, { status: 400 })

  const supabase = createClient()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10,0,0,0)

  const { data, error } = await supabase.from('drops').insert({
    zip_code: zip_code.trim(),
    title,
    description,
    business_name,
    claim_url,
    price_paid: price_paid || 0,
    is_sponsored: true,
    type: 'deal',
    starts_at: tomorrow.toISOString(),
    ends_at: new Date(tomorrow.getTime() + 24*60*60*1000).toISOString()
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ drop: data })
}
