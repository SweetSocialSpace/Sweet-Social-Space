'use server'

import { z } from 'zod'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Events system stubbed. Will wire up in Phase 2.

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
  // Phase 1 stub: return empty array
  return []
}

export async function getEvent(input: { id: string }): Promise<UpcomingEventDTO | null> {
  // Phase 1 stub: return null
  return null
}

export async function createEvent(input: {
  title: string
  description?: string | null
  starts_at: string
  ends_at?: string | null
  venue_name?: string | null
  address?: string | null
  city?: string | null
  state_code?: string | null
  latitude?: number | null
  longitude?: number | null
  organizer?: string | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function updateEvent(input: {
  id: string
  title?: string
  description?: string | null
}): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function deleteEvent(input: { id: string }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}
