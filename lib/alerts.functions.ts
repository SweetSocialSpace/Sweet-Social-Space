'use server'

import { z } from 'zod'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Alerts stubbed - global, house-safe

export type AlertCategory = "weather" | "traffic" | "missing_person" | "public_safety" | "lost_pet"

export type AlertDTO = {
  id: string; title: string; body: string; severity: "info" | "warning" | "critical";
  category: AlertCategory; location_label: string | null; city: string | null; state_code: string | null;
  latitude: number | null; longitude: number | null; created_at: string; is_automated?: boolean; source_label?: string | null
}

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  weather: "Weather", traffic: "Traffic", missing_person: "Missing Person", public_safety: "Public Safety", lost_pet: "Lost Pet",
}

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(), lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(), country_code: z.string().nullable().optional(),
}).partial()

export async function listAlerts(input?: { limit?: number; scope?: Partial<LocationFilter> }): Promise<AlertDTO[]> {
  try { return [] } catch { return [] }
}

export async function getAlert(input: { id: string }): Promise<AlertDTO | null> {
  try { return null } catch { return null }
}
