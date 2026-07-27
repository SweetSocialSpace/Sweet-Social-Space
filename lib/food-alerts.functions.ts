'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const BOT_USER_ID = "b0700000-0000-0000-0000-000000095122" // bot identity, not geography filter

async function getAuthSafe() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return { supabase, userId: user.id }
  } catch {
    return null // House never dies
  }
}

async function assertAdminSafe(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
    if (error) return false
    return data === true
  } catch {
    return false
  }
}

const inputSchema = z.object({
  vendor: z.string().trim().min(1).max(80),
  caption: z.string().trim().min(1).max(400),
  source_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  zip_code: z.string().trim().min(2).max(12), // Global - accepts 5-digit US, 6-digit CA, etc.
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export async function postFoodAlert(input: z.infer<typeof inputSchema>): Promise<{ ok: true; post_id: string } | { error: string }> {
  try {
    const parsed = inputSchema.parse(input)
    const auth = await getAuthSafe()
    if (!auth) return { error: 'Please sign in' }
    
    const isAdmin = await assertAdminSafe(auth.supabase, auth.userId)
    if (!isAdmin) return { error: 'Admin only' }

    // GLOBAL - uses passed zip, works any country, any block
    const { data, error } = await auth.supabase.from('posts').insert({
      body: `${parsed.vendor}: ${parsed.caption}`,
      tag: 'Alert',
      zip_code: parsed.zip_code,
      latitude: parsed.lat,
      longitude: parsed.lng,
      user_id: BOT_USER_ID,
      source_url: parsed.source_url || null,
    }).select('id').single()

    if (error) return { error: error.message }
    if (!data) return { error: 'Could not post alert' }
    return { ok: true, post_id: data.id }
  } catch (e: any) {
    return { error: e?.message || 'Safe mode - try again' }
  }
}
