'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'

// Admin-pasted food alerts (e.g. La Placita, taco trucks).
// Posts to the 95122 feed as the community bot under tag="Alert".

const BOT_USER_ID = "b0700000-0000-0000-0000-000000095122"
const ZIP = "95122"
const ZIP_LAT = 37.3382
const ZIP_LNG = -121.8413

async function getAuth() {
  const supabase = createServerClient()
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
  const data = inputSchema.parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const srcLine = data.source_url ? `\n\nSource: ${data.source_url}` : ""
  const body = `🔴 95122 Food Alert — ${data.vendor}: ${data.caption}${srcLine}`.slice(0, 500)

  const { data: row, error } = await supabaseAdmin
  .from("posts")
  .insert({
    user_id: BOT_USER_ID,
    body,
    tag: "Alert",
    latitude: ZIP_LAT,
    longitude: ZIP_LNG,
    state_code: "CA",
    country_code: "US",
    zip_code: ZIP,
  } as any)
  .select("id")
  .single()
  if (error) throw new Error(error.message)
  return { ok: true, post_id: row!.id as string }
}
