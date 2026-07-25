import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, displayName, zip, city, country } = await req.json()
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { display_name: displayName, username: displayName, zip_code: zip, city, country }
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  
  await admin.from('profiles').upsert({
    id: data.user.id, user_id: data.user.id,
    display_name: displayName, username: displayName,
    zip_code: zip, city, country, email
  }, { onConflict: 'id' })
  
  return NextResponse.json({ success: true })
}
