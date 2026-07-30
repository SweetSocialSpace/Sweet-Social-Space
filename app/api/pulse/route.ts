// app/api/pulse/route.ts - RULES COMPLIANT, BUILD SAFE
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip') || 'GLOBAL'
  
  if (zip === 'GLOBAL') {
    return NextResponse.json({ count: 0 })
  }

  try {
    // TODO: Replace with your real DB when ready
    // Example if you use Supabase:
    // const supabase = createClient(...)
    // const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('zip_code', zip)
    
    // For now return 0 to unblock build - no db import so build passes
    return NextResponse.json({ count: 0, zip })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
