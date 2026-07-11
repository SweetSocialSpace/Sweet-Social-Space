'use server'

import { z } from 'zod'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Community updates stubbed. Will wire up in Phase 2.

export type CommunityUpdateDTO = {
  id: string
  title: string
  body: string
  category: string | null
  location_label: string | null
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  created_by: string | null
  is_published: boolean
}

const SELECT_COLS = "id,title,body,category,location_label,city,state_code,latitude,longitude,created_at,created_by,is_published"

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

export async function listCommunityUpdates(input?: { limit?: number; scope?: Partial<LocationFilter> }): Promise<CommunityUpdateDTO[]> {
  // Phase 1 stub: return empty array
  return []
}

export async function getCommunityUpdate(input: { id: string }): Promise<CommunityUpdateDTO | null> {
  // Phase 1 stub: return null
  return null
}

export async function createCommunityUpdate(input: {
  title: string
  body: string
  category?: string | null
  location_label?: string | null
  city?: string | null
  state_code?: string | null
  latitude?: number | null
  longitude?: number | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function updateCommunityUpdate(input: {
  id: string
  title?: string
  body?: string
  category?: string | null
  is_published?: boolean
}): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function deleteCommunityUpdate(input: { id: string }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}
