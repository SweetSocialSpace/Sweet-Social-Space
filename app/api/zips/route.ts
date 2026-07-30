import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(){
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('zip_code').not('zip_code','is',null).limit(100)
  const zips = [...new Set((data||[]).map((r:any)=>r.zip_code).filter(Boolean))]
  return NextResponse.json(zips.length? zips : ['GLOBAL'])
}
