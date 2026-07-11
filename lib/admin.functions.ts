'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: All admin functions stubbed to return safe defaults
// Will wire up real admin features in Phase 2

// Use the SECURITY DEFINER has_role RPC so admin checks are not affected by
// user_roles RLS visibility from the authenticated client.
export async function checkAdminRole(): Promise<{ allowed: boolean }> {
  // Phase 1 stub: always false for now
  return { allowed: false }
}

const toggleSchema = z.object({
  user_id: z.string().uuid(),
  make_admin: z.boolean(),
})

export async function adminToggleUserRole(
  input: z.infer<typeof toggleSchema>
): Promise<{ ok: true; is_admin: boolean }> {
  // Phase 1 stub
  return { ok: true, is_admin: false }
}

export async function adminListAdminUserIds(): Promise<string[]> {
  // Phase 1 stub: return empty array
  return []
}

export async function adminRunCommunityBot(): Promise<{
  ok: true
  processed_locations: number
  alerts: number
  events: number
  updates: number
  verified: number
}> {
  // Phase 1 stub
  return {
    ok: true,
    processed_locations: 0,
    alerts: 0,
    events: 0,
    updates: 0,
    verified: 0
  }
}
