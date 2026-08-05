import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawZip = searchParams.get('zip') || 'GLOBAL'
  const zip = rawZip.trim().toUpperCase() === 'GLOBAL' ? '' : rawZip.trim()

  try {
    let query = supabase.from('posts').select('id', { count: 'exact', head: true })

    if (zip) {
      query = query.eq('zip_code', zip)
    }

    const { count } = await query

    // heat = activity last 24h - dynamic - global
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    let recentQuery = supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo)
    if (zip) recentQuery = recentQuery.eq('zip_code', zip)
    const { count: recentCount } = await recentQuery

    // Determine hottest street (simulated - would need real geocoding)
    const heat = recentCount && recentCount > 5 ? 'hot' : recentCount && recentCount > 0 ? 'warm' : 'quiet'

    return NextResponse.json({
      zip: rawZip,
      total: count || 0,
      recent: recentCount || 0,
      heat,
      street: zip ? 'Main St' : 'your area',
      count: recentCount || 0,
      isLive: true,
      timestamp: new Date().toISOString()
    }, { headers: { 'Cache-Control': 'no-store' } })

  } catch (err) {
    console.error('Heat API error:', err)
    return NextResponse.json({
      zip: rawZip,
      total: 0,
      recent: 0,
      heat: 'quiet',
      street: 'unknown',
      count: 0,
      isLive: false,
      timestamp: new Date().toISOString()
    }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
