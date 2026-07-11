'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'

// Phase 1: Marketplace system stubbed. Will wire up in Phase 2.

export type MarketplaceListingDTO = {
  id: string
  title: string
  description: string | null
  price_cents: number | null
  currency: string | null
  category: string | null
  condition: string | null
  location_label: string | null
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  seller_id: string
  created_at: string
  images: string[] | null
  is_sold: boolean
}

const SELECT_COLS = "id,title,description,price_cents,currency,category,condition,location_label,city,state_code,latitude,longitude,seller_id,created_at,images,is_sold"

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

export async function listMarketplaceItems(input?: { 
  limit?: number; 
  scope?: Partial<LocationFilter>;
  category?: string | null;
  min_price?: number | null;
  max_price?: number | null;
}): Promise<MarketplaceListingDTO[]> {
  // Phase 1 stub: return empty array
  return []
}

export async function getMarketplaceItem(input: { id: string }): Promise<MarketplaceListingDTO | null> {
  // Phase 1 stub
  return null
}

export async function createMarketplaceItem(input: {
  title: string
  description?: string | null
  price_cents?: number | null
  currency?: string | null
  category?: string | null
  condition?: string | null
  location_label?: string | null
  city?: string | null
  state_code?: string | null
  latitude?: number | null
  longitude?: number | null
  images?: string[] | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function updateMarketplaceItem(input: {
  id: string
  title?: string
  description?: string | null
  price_cents?: number | null
  is_sold?: boolean
}): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function deleteMarketplaceItem(input: { id: string }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}
