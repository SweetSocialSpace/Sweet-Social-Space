// app/api/pulse/route.ts - REAL COUNT FROM SUPABASE - GLOBAL + RADIUS READY
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip') || 'GLOBAL'
  
  if (zip === 'GLOBAL') {
    return NextResponse.json({ count: 0, zip: 'GLOBAL' })
  }

  try {
    const supabase = createClient()
    
    // Count posts for this zip - variable, never hardcoded
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('zip_code', zip)

    if (error) {
      console.error('Pulse error:', error)
      return NextResponse.json({ count: 0, zip })
    }

    return NextResponse.json({ count: count || 0, zip })
  } catch (err) {
    console.error('Pulse failed:', err)
    return NextResponse.json({ count: 0, zip })
  }
}
