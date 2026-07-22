'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const BOT_USER_ID = "b0700000-0000-0000-0000-000000095122" // keep same bot

async function getAuth() {
  const supabase = await createClient()
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
  zip_code: z.string().trim().min(5).max(10), // GLOBAL FIX: require zip param
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export async function postFoodAlert(input: z.infer<typeof inputSchema>): Promise<{ ok: true; post_id: string }> {
  const parsed = inputSchema.parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)

  // GLOBAL FIX: use passed zip, not hardcoded
  const { data, error } = await supabase.from('posts').insert({
    body: `${parsed.vendor}: ${parsed.caption}`,
    tag: 'Alert',
    zip_code: parsed.zip_code, // was ZIP = 95122
    latitude: parsed.lat,
    longitude: parsed.lng,
    user_id: BOT_USER_ID,
    source_url: parsed.source_url || null,
  }).select('id').single()

  if (error) throw error
  return { ok: true, post_id: data.id }
}
