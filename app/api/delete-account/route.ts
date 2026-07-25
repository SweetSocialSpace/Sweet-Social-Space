import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Delete all user data — what goes on in zip stays, but user can leave
  await admin.from('posts').delete().eq('user_id', user.id)
  await admin.from('profiles').delete().eq('user_id', user.id)
  await admin.from('profiles').delete().eq('id', user.id)
  
  // Delete auth user — this unsubscribes everything
  await admin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ ok: true })
}
