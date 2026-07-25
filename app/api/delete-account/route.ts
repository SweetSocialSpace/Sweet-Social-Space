import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Delete posts first (foreign key)
  await admin.from('posts').delete().eq('user_id', user.id)
  
  // 2. Delete profile — kills ghost forever
  await admin.from('profiles').delete().eq('id', user.id)
  await admin.from('profiles').delete().eq('user_id', user.id)
  
  // 3. Delete auth user
  const { error } = await admin.auth.admin.deleteUser(user.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
