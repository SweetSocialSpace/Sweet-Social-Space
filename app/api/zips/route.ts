import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('zip')
      .not('zip', 'is', null)
      .neq('zip', '')
      .neq('zip', 'GLOBAL')
      .limit(100)

    if (error) throw error

    const raw = (data || []).map((r: any) => String(r.zip).trim()).filter(Boolean)
    const zips = Array.from(new Set(raw))

    if (zips.length === 0) {
      return NextResponse.json(['95122'])
    }

    return NextResponse.json(zips, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch {
    return NextResponse.json(['95122'], {
      headers: { 'Cache-Control': 'no-store' }
    })
  }
}
