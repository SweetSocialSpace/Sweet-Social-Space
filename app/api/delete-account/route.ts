import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. delete all app data FIRST — use both id fields
  await admin.from('posts').delete().eq('user_id', user.id)
  await admin.from('posts').delete().eq('author_id', user.id) // if you use author_id somewhere
  await admin.from('profiles').delete().eq('id', user.id)
  await admin.from('profiles').delete().eq('user_id', user.id)
  await admin.from('comments').delete().eq('user_id', user.id)
  await admin.from('likes').delete().eq('user_id', user.id)

  // 2. then delete auth — this is last
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, deleted: user.id })
}
