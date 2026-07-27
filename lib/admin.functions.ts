'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Admin stubbed - global, house-safe, never dies

export async function checkAdminRole(): Promise<{ allowed: boolean }> {
  try { return { allowed: false } } catch { return { allowed: false } }
}

const toggleSchema = z.object({
  user_id: z.string().uuid(),
  make_admin: z.boolean(),
})

export async function adminToggleUserRole(
  input: z.infer<typeof toggleSchema>
): Promise<{ ok: true; is_admin: boolean }> {
  try { return { ok: true, is_admin: false } } catch { return { ok: true, is_admin: false } }
}

export async function adminListAdminUserIds(): Promise<string[]> {
  try { return [] } catch { return [] }
}

export async function adminRunCommunityBot(): Promise<{
  ok: true
  processed_locations: number
  alerts: number
  events: number
  updates: number
  verified: number
}> {
  try {
    return { ok: true, processed_locations: 0, alerts: 0, events: 0, updates: 0, verified: 0 }
  } catch {
    return { ok: true, processed_locations: 0, alerts: 0, events: 0, updates: 0, verified: 0 }
  }
}
