import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip')?.trim()
  if (!zip) return NextResponse.json({ drop: null })

  const supabase = createClient()
  
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)

  let { data: drop } = await supabase
    .from('drops')
    .select('*')
    .eq('zip_code', zip)
    .gte('starts_at', todayStart.toISOString())
    .order('is_sponsored', { ascending: false })
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!drop) {
    const res = await supabase
      .from('drops')
      .select('*')
      .eq('zip_code', zip)
      .order('starts_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    drop = res.data
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
