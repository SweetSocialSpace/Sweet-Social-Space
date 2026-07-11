'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'
import { bboxForRadius, milesBetween, SCOPE_RADIUS_MILES, type ScopeKind } from '@/lib/location-scope'

const input = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  exclude_user_id: z.string().uuid().nullable().optional(),
})

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error ||!user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

export async function countNeighborsNearby(data: z.infer<typeof input>): Promise<{ count: number }> {
  const parsed = input.parse(data)
  await getAuth()
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const scope = parsed.scope as ScopeKind
  const radius = SCOPE_RADIUS_MILES[scope]

  if (radius!= null) {
    if (parsed.lat == null || parsed.lng == null) return { count: 0 }
    const b = bboxForRadius(parsed.lat, parsed.lng, radius)
    let q = supabaseAdmin
   .from("profiles")
   .select("user_id, latitude, longitude")
   .gte("latitude", b.minLat).lte("latitude", b.maxLat)
   .gte("longitude", b.minLng).lte("longitude", b.maxLng)
    if (parsed.exclude_user_id) q = q.neq("user_id", parsed.exclude_user_id)
    const { data: rows, error } = await q
    if (error) throw new Error(error.message)
    const count = (rows?? []).filter((r) =>
      r.latitude!= null && r.longitude!= null &&
      milesBetween(parsed.lat!, parsed.lng!, r.latitude as number, r.longitude as number) <= radius
    ).length
    return { count }
  }

  if (scope === "state" && parsed.state_code) {
    let q = supabaseAdmin
   .from("profiles")
   .select("user_id", { count: "exact", head: true })
   .eq("state_code", parsed.state_code.toUpperCase())
    if (parsed.exclude_user_id) q = q.neq("user_id", parsed.exclude_user_id)
    const { count, error } = await q
    if (error) throw new Error(error.message)
    return { count: count?? 0 }
  }

  let q = supabaseAdmin.from("profiles").select("user_id", { count: "exact", head: true })
  if (parsed.exclude_user_id) q = q.neq("user_id", parsed.exclude_user_id)
  const { count, error } = await q
  if (error) throw new Error(error.message)
  return { count: count?? 0 }
}
