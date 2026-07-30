import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(){
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('zip_code').not('zip_code','is',null).limit(100)
  const raw = (data||[]).map((r:any)=>r.zip_code).filter(Boolean)
  const zips = raw.filter((v:any,i:number,a:any[])=>a.indexOf(v)===i)
  return NextResponse.json(zips.length? zips : ['GLOBAL'])
}
