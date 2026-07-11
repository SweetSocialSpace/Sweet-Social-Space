'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'

// Phase 1: Business directory CMS stubbed. Will wire up in Phase 2.

export type BusinessDirectoryDTO = {
  id: string
  name: string
  slug: string
  category: string | null
  description: string | null
  address: string | null
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  website: string | null
  logo_url: string | null
  verified: boolean
}

const SELECT_COLS = "id,name,slug,category,description,address,city,state_code,latitude,longitude,website,logo_url,verified"

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

export async function listBusinesses(input?: { limit?: number; scope?: Partial<LocationFilter> }): Promise<BusinessDirectoryDTO[]> {
  // Phase 1 stub: return empty array
  return []
}

/* =========================================================
   Hours, photos, promotions, claims
   ========================================================= */

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
export type DayKey = typeof DAYS[number]
export type DayHours = { closed: boolean; open?: string; close?: string }
export type HoursJson = Partial<Record<DayKey, DayHours>>

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
}

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})
const hoursSchema = z.object({
  mon: dayHoursSchema.optional(),
  tue: dayHoursSchema.optional(),
  wed: dayHoursSchema.optional(),
  thu: dayHoursSchema.optional(),
  fri: dayHoursSchema.optional(),
  sat: dayHoursSchema.optional(),
  sun: dayHoursSchema.optional(),
})

export type BusinessPhotoDTO = {
  id: string
  business_id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export type BusinessPromotionDTO = {
  id: string
  business_id: string
  title: string
  body: string | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

/* ---------- Public reads ---------- */

export async function getBusinessExtras(input: { business_id: string }): Promise<{
  photos: BusinessPhotoDTO[]
  promotions: BusinessPromotionDTO[]
  hours: HoursJson | null
}> {
  // Phase 1 stub
  return {
    photos: [],
    promotions: [],
    hours: null,
  }
}

/* ---------- Owner mutations ---------- */

export async function setBusinessHours(input: { business_id: string; hours: HoursJson }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function addBusinessPhoto(input: {
  business_id: string
  url: string
  caption?: string | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function deleteBusinessPhoto(input: { id: string }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function addBusinessPromotion(input: {
  business_id: string
  title: string
  body?: string | null
  starts_at?: string | null
  ends_at?: string | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function deleteBusinessPromotion(input: { id: string }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

/* ---------- Claims ---------- */

export type BusinessClaimDTO = {
  id: string
  business_id: string
  business_name: string | null
  business_slug: string | null
  claimant_id: string
  claimant_name: string | null
  message: string | null
  contact_email: string | null
  proof_url: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  resolved_at: string | null
}

export async function submitBusinessClaim(input: {
  business_id: string
  message?: string | null
  contact_email?: string | null
  proof_url?: string | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function listMyBusinessClaims(): Promise<BusinessClaimDTO[]> {
  // Phase 1 stub
  return []
}

/* ---------- Admin ---------- */

export async function adminListBusinessClaims(input?: { status?: "pending" | "approved" | "rejected" | "all" }): Promise<BusinessClaimDTO[]> {
  // Phase 1 stub
  return []
}

export async function adminResolveBusinessClaim(input: {
  id: string
  action: "approve" | "reject"
  verify?: boolean
}): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function adminSetBusinessVerified(input: { business_id: string; verified: boolean }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

/* ---------- Helpers ---------- */

export function formatHoursForDay(h: DayHours | undefined): string {
  if (!h || h.closed) return "Closed"
  if (!h.open ||!h.close) return "—"
  return `${h.open} – ${h.close}`
}

export function isOpenNow(hours: HoursJson | null): boolean | null {
  if (!hours) return null
  const now = new Date()
  const key = DAYS[(now.getDay() + 6) % 7] // JS: Sun=0 → shift so Mon=0
  const today = hours[key]
  if (!today || today.closed ||!today.open ||!today.close) return false
  const [oH, oM] = today.open.split(":").map(Number)
  const [cH, cM] = today.close.split(":").map(Number)
  const cur = now.getHours() * 60 + now.getMinutes()
  return cur >= oH * 60 + oM && cur <= cH * 60 + cM
}
