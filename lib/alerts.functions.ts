'use server'

import { z } from 'zod'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export type AlertCategory = "weather" | "traffic" | "missing_person" | "public_safety" | "lost_pet"

export type AlertDTO = {
  id: string
  title: string
  body: string
  severity: "info" | "warning" | "critical"
  category: AlertCategory
  location_label: string | null
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  is_automated?: boolean
  source_label?: string | null
}

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  weather: "Weather",
  traffic: "Traffic",
  missing_person: "Missing Person",
  public_safety: "Public Safety",
  lost_pet: "Lost Pet",
}

const SELECT_COLS = "id,title,body,severity,category,location_label,city,state_code,latitude,longitude,created_at,is_automated,source_label"

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

export async function listAlerts(input?: { limit?: number; scope?: Partial<LocationFilter> }): Promise<AlertDTO[]> {
  const limit = Math.min(Math.max(input?.limit?? 5, 1), 50)
  const scope = normalizeScopeInput(scopeInput.parse(input?.scope?? {}))

  let q = supabaseAdmin.from("alerts").select(SELECT_COLS).eq("status", "published").order("created_at", { ascending: false })

  const radius = SCOPE_RADIUS_MILES[scope.scope]
  if (radius!= null && scope.lat!= null && scope.lng!= null) {
    const b = bboxForRadius(scope.lat, scope.lng, radius)
    q = q.gte("latitude", b.minLat).lte("latitude", b.maxLat).gte("longitude", b.minLng).lte("longitude", b.maxLng)
  } else if (scope.scope === "state" && scope.state_code) {
    q = q.eq("state_code", scope.state_code.toUpperCase())
  }

  const { data: rows, error } = await q.limit(Math.max(limit * 3, 20))
  if (error) throw new Error(error.message)
  const filtered = applyScope((rows?? []) as AlertDTO[], scope)
  return filtered.slice(0, limit)
}

export async function getAlert(input: { id: string }): Promise<AlertDTO | null> {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)

  const { data: row, error } = await supabaseAdmin
  .from("alerts")
  .select(SELECT_COLS)
  .eq("id", id)
  .eq("status", "published")
  .maybeSingle()
  if (error) throw new Error(error.message)
  return (row as AlertDTO | null)?? null
}
