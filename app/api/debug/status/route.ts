import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  const supabase = createClient()
  const checks: any = {}

  try {
    const { count: posts } = await supabase.from('posts').select('*', { count: 'exact', head: true })
    checks.posts = posts
    const { count: marketplace } = await supabase.from('marketplace').select('*', { count: 'exact', head: true })
    checks.marketplace = marketplace
    const { count: businesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true })
    checks.businesses = businesses
    const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true })
    checks.events = events
    const { count: alerts } = await supabase.from('alerts').select('*', { count: 'exact', head: true })
    checks.alerts = alerts
  } catch(e:any) {
    checks.error = e.message
  }

  return NextResponse.json({ zip: '95122', ...checks, time: new Date().toISOString() })
}
