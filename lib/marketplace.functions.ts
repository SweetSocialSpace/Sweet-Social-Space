'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'

// Phase 1: Marketplace stubbed - global, independent, house-safe, automated

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
  try { return [] } catch { return [] }
}

export async function getMarketplaceItem(input: { id: string }): Promise<MarketplaceListingDTO | null> {
  try { return null } catch { return null }
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
  try { return { id: "stubbed-for-phase-1" } } catch { return { id: "stubbed" } }
}

export async function updateMarketplaceItem(input: {
  id: string
  title?: string
  description?: string | null
  price_cents?: number | null
  is_sold?: boolean
}): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}

export async function deleteMarketplaceItem(input: { id: string }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}
