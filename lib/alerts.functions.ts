'use server'

import { z } from 'zod'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Alerts system stubbed. Will wire up in Phase 2.

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
  // Phase 1 stub: return empty array
  return []
}

export async function getAlert(input: { id: string }): Promise<AlertDTO | null> {
  // Phase 1 stub: return null
  return null
}
