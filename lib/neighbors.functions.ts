'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { bboxForRadius, milesBetween, SCOPE_RADIUS_MILES, type ScopeKind } from '@/lib/location-scope'

// Phase 1: Neighbors/social graph system stubbed. Will wire up in Phase 2.

const input = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  limit: z.number().min(1).max(50).optional(),
}).partial()

export type NeighborDTO = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  distance_miles: number | null
  mutual_friends: number
  created_at: string
}

export async function listNearbyUsers(inputParams?: z.infer<typeof input>): Promise<NeighborDTO[]> {
  // Phase 1 stub: return empty array
  return []
}

export async function getNearbyUsersCount(inputParams?: z.infer<typeof input>): Promise<{ count: number }> {
  // Phase 1 stub
  return { count: 0 }
}

export async function findUsersByLocation(input: {
  city?: string | null
  state_code?: string | null
  limit?: number
}): Promise<NeighborDTO[]> {
  // Phase 1 stub
  return []
}

export async function getMutualConnections(input: {
  user_id: string
  limit?: number
}): Promise<NeighborDTO[]> {
  // Phase 1 stub
  return []
}

export async function suggestConnections(input?: {
  limit?: number
}): Promise<NeighborDTO[]> {
  // Phase 1 stub
  return []
}
