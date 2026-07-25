import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing SERVICE_ROLE_KEY in Vercel env' }, { status: 500 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete in order — posts first (foreign key), then profiles
    const { error: postErr } = await admin.from('posts').delete().eq('user_id', user.id)
    if (postErr) console.log('post delete err', postErr)

    await admin.from('profiles').delete().eq('user_id', user.id)
    await admin.from('profiles').delete().eq('id', user.id)

    const { error: authErr } = await admin.auth.admin.deleteUser(user.id)
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('delete-account error', e)
    return NextResponse.json({ error: e.message || 'Unknown' }, { status: 500 })
  }
}
