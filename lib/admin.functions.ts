'use server'

import { z } from 'zod'
import { requireAuth } from '@/integrations/supabase/client.server'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { headers } from 'next/headers'

// Use the SECURITY DEFINER has_role RPC so admin checks are not affected by
// user_roles RLS visibility from the authenticated client.
export async function checkAdminRole(): Promise<{ allowed: boolean }> {
  const { supabase, userId } = await requireAuth()
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin',
  })
  if (error) {
    console.error('[admin] role check failed', error.message)
    return { allowed: false }
  }
  return { allowed: data === true }
}

const toggleSchema = z.object({
  user_id: z.string().uuid(),
  make_admin: z.boolean(),
})

export async function adminToggleUserRole(
  input: z.infer<typeof toggleSchema>
): Promise<{ ok: true; is_admin: boolean }> {
  const { user_id, make_admin } = toggleSchema.parse(input)
  const { userId } = await requireAuth()

  // Caller must be admin
  const { supabase } = await requireAuth()
  const { data: callerOk } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin',
  })
  if (callerOk!== true) throw new Error('Admin only')

  // Don't let admins remove their own admin role (avoid lock-out)
  if (user_id === userId &&!make_admin) {
    throw new Error('You cannot remove your own admin role.')
  }

  if (make_admin) {
    const { error } = await supabaseAdmin
     .from('user_roles')
     .insert({ user_id: user_id, role: 'admin' })
    // ignore unique-violation duplicates
    if (error && (error as any).code!== '23505') throw new Error(error.message)
    return { ok: true, is_admin: true }
  }

  const { error } = await supabaseAdmin
   .from('user_roles')
   .delete()
   .eq('user_id', user_id)
   .eq('role', 'admin')
  if (error) throw new Error(error.message)
  return { ok: true, is_admin: false }
}

export async function adminListAdminUserIds(): Promise<string[]> {
  const { supabase, userId } = await requireAuth()
  const { data: ok } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
  if (ok!== true) throw new Error('Admin only')

  const { data, error } = await supabaseAdmin
   .from('user_roles')
   .select('user_id')
   .eq('role', 'admin')
  if (error) throw new Error(error.message)
  return (data?? []).map((r: { user_id: string }) => r.user_id)
}

export async function adminRunCommunityBot(): Promise<{
  ok: true
  processed_locations: number
  alerts: number
  events: number
  updates: number
  verified: number
}> {
  const { supabase, userId } = await requireAuth()
  const { data: ok } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
  if (ok!== true) throw new Error('Admin only')

  const secret = process.env.COMMUNITY_BOT_SECRET
  if (!secret) throw new Error('COMMUNITY_BOT_SECRET not configured')

  const headersList = headers()
  const host = headersList.get('host') || 'localhost:3000'
  const proto = host.includes('localhost')? 'http' : 'https'
  const url = `${proto}://${host}/api/public/hooks/community-bot`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bot-secret': secret },
    body: '{}',
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Bot tick failed (${res.status}): ${text.slice(0, 200)}`)
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Bot tick returned non-JSON: ${text.slice(0, 200)}`)
  }
}
