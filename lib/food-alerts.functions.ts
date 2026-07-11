'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Admin-pasted food alerts stubbed. Will wire up in Phase 2.
// Posts to the 95122 feed as the community bot under tag="Alert".

const BOT_USER_ID = "b0700000-0000-0000-0000-000000095122"
const ZIP = "95122"
const ZIP_LAT = 37.3382
const ZIP_LNG = -121.8413

async function getAuth() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (error || data!== true) throw new Error("Admin only")
}

const inputSchema = z.object({
  vendor: z.string().trim().min(1).max(80),
  caption: z.string().trim().min(1).max(400),
  source_url: z.string().trim().url().max(500).optional().or(z.literal("")),
})

export async function postFoodAlert(input: z.infer<typeof inputSchema>): Promise<{ ok: true; post_id: string }> {
  // Phase 1 stub: disabled
  return { ok: true, post_id: "stubbed-for-phase-1" }
}
