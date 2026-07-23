import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get('zip');

  const supabase = createClient()
  const checks: any = {}

  try {
    let basePosts = supabase.from('posts').select('*', { count: 'exact', head: true })
    if (zip) basePosts = basePosts.eq('zip_code', zip)
    const { count: posts } = await basePosts
    checks.posts = posts

    let baseMarket = supabase.from('marketplace').select('*', { count: 'exact', head: true })
    if (zip) baseMarket = baseMarket.eq('zip_code', zip)
    const { count: marketplace } = await baseMarket
    checks.marketplace = marketplace

    const { count: businesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq(zip ? 'zip_code' : 'zip_code', zip || '0')
    checks.businesses = businesses

    const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true })
    checks.events = events

    const { count: alerts } = await supabase.from('alerts').select('*', { count: 'exact', head: true })
    checks.alerts = alerts
  } catch(e:any) {
    checks.error = e.message
  }

  return NextResponse.json({ zip: zip || 'global', ...checks, time: new Date().toISOString() }) // GLOBAL FIX: was '95122'
}
