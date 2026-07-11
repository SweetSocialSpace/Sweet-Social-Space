'use server'

import { z } from 'zod'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export type UpcomingEventDTO = {
  id: string
  title: string
  description: string | null
  venue_name: string | null
  address: string | null
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  organizer: string | null
  starts_at: string | null
  ends_at: string | null
  is_automated?: boolean
}

const SELECT_COLS = "id,title,description,venue_name,address,city,state_code,latitude,longitude,organizer,starts_at,ends_at,is_automated"

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

export async function listUpcomingEvents(input?: { limit?: number; scope?: Partial<LocationFilter> }): Promise<UpcomingEventDTO[]> {
  const limit = Math.min(Math.max(input?.limit?? 6, 1), 24)
  const scope = normalizeScopeInput(scopeInput.parse(input?.scope?? {}))

  let q = supabaseAdmin
  .from("events")
  .select(SELECT_COLS)
  .eq("hidden", false)
  .gte("starts_at", new Date().toISOString())
  .order("starts_at", { ascending: true })

  const radius = SCOPE_RADIUS_MILES[scope.scope]
  if (radius!= null && scope.lat!= null && scope.lng!= null) {
    const b = bboxForRadius(scope.lat, scope.lng, radius)
    q = q.gte("latitude", b.minLat).lte("latitude", b.maxLat).gte("longitude", b.minLng).lte("longitude", b.maxLng)
  } else if (scope.scope === "state" && scope.state_code) {
    q = q.eq("state_code", scope.state_code.toUpperCase())
  }

  const { data: rows, error } = await q.limit(Math.max(limit * 3, 20))
  if (error) throw new Error(error.message)
  const filtered = applyScope((rows?? []) as UpcomingEventDTO[], scope)
  return filtered.slice(0, limit)
}
