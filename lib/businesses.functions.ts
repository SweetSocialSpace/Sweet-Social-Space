'use server'

import { z } from 'zod'
import { requireAuth } from '@/integrations/supabase/client.server'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'

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
  const limit = Math.min(Math.max(input?.limit?? 6, 1), 50)
  const scope = normalizeScopeInput(scopeInput.parse(input?.scope?? {}))

  let q = supabaseAdmin
  .from("businesses")
  .select(SELECT_COLS)
  .order("verified", { ascending: false })
  .order("created_at", { ascending: false })

  const radius = SCOPE_RADIUS_MILES[scope.scope]
  if (radius!= null && scope.lat!= null && scope.lng!= null) {
    const b = bboxForRadius(scope.lat, scope.lng, radius)
    q = q.gte("latitude", b.minLat).lte("latitude", b.maxLat).gte("longitude", b.minLng).lte("longitude", b.maxLng)
  } else if (scope.scope === "state" && scope.state_code) {
    q = q.eq("state_code", scope.state_code.toUpperCase())
  }

  const { data: rows, error } = await q.limit(Math.max(limit * 3, 20))
  if (error) throw new Error(error.message)
  const filtered = applyScope((rows?? []) as BusinessDirectoryDTO[], scope)
  return filtered.slice(0, limit)
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
  const { business_id } = z.object({ business_id: z.string().uuid() }).parse(input)

  const [photosRes, promosRes, bizRes] = await Promise.all([
    supabaseAdmin
    .from("business_photos")
    .select("id,business_id,url,caption,sort_order,created_at")
    .eq("business_id", business_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(40),
    supabaseAdmin
    .from("business_promotions")
    .select("id,business_id,title,body,starts_at,ends_at,created_at")
    .eq("business_id", business_id)
    .order("created_at", { ascending: false })
    .limit(20),
    supabaseAdmin
    .from("businesses")
    .select("hours_json")
    .eq("id", business_id)
    .maybeSingle(),
  ])
  const now = Date.now()
  const promotions = ((promosRes.data?? []) as BusinessPromotionDTO[]).filter((p) => {
    if (p.ends_at && new Date(p.ends_at).getTime() < now) return false
    return true
  })
  return {
    photos: (photosRes.data?? []) as BusinessPhotoDTO[],
    promotions,
    hours: ((bizRes.data as { hours_json: HoursJson | null } | null)?.hours_json)?? null,
  }
}

/* ---------- Owner mutations ---------- */

async function assertOwnerOrAdmin(supabase: any, userId: string, businessId: string) {
  const [bizRes, adminRes] = await Promise.all([
    supabase.from("businesses").select("owner_id").eq("id", businessId).maybeSingle(),
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
  ])
  const ownerId = (bizRes.data as { owner_id: string } | null)?.owner_id
  if (ownerId === userId) return
  if (adminRes.data === true) return
  throw new Error("Not allowed")
}

export async function setBusinessHours(input: { business_id: string; hours: HoursJson }): Promise<{ ok: true }> {
  const { business_id, hours } = z.object({ business_id: z.string().uuid(), hours: hoursSchema }).parse(input)
  const { supabase, userId } = await requireAuth()
  await assertOwnerOrAdmin(supabase, userId, business_id)
  const { error } = await supabase
  .from("businesses")
  .update({ hours_json: hours })
  .eq("id", business_id)
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function addBusinessPhoto(input: {
  business_id: string
  url: string
  caption?: string | null
}): Promise<{ id: string }> {
  const { business_id, url, caption } = z.object({
    business_id: z.string().uuid(),
    url: z.string().url().max(2000),
    caption: z.string().max(280).optional().nullable(),
  }).parse(input)
  const { supabase, userId } = await requireAuth()
  await assertOwnerOrAdmin(supabase, userId, business_id)
  const { data: ins, error } = await supabase
  .from("business_photos")
  .insert({
      business_id: business_id,
      url: url,
      caption: caption?? null,
      created_by: userId,
    })
  .select("id")
  .single()
  if (error) throw new Error(error.message)
  return { id: (ins as { id: string }).id }
}

export async function deleteBusinessPhoto(input: { id: string }): Promise<{ ok: true }> {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await requireAuth()
  const { data: photo, error: pErr } = await supabase
  .from("business_photos").select("business_id").eq("id", id).maybeSingle()
  if (pErr) throw new Error(pErr.message)
  if (!photo) throw new Error("Photo not found")
  await assertOwnerOrAdmin(supabase, userId, (photo as { business_id: string }).business_id)
  const { error } = await supabase.from("business_photos").delete().eq("id", id)
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function addBusinessPromotion(input: {
  business_id: string
  title: string
  body?: string | null
  starts_at?: string | null
  ends_at?: string | null
}): Promise<{ id: string }> {
  const { business_id, title, body, starts_at, ends_at } = z.object({
    business_id: z.string().uuid(),
    title: z.string().min(1).max(120),
    body: z.string().max(2000).optional().nullable(),
    starts_at: z.string().datetime().optional().nullable(),
    ends_at: z.string().datetime().optional().nullable(),
  }).parse(input)
  const { supabase, userId } = await requireAuth()
  await assertOwnerOrAdmin(supabase, userId, business_id)
  const { data: ins, error } = await supabase
  .from("business_promotions")
  .insert({
      business_id: business_id,
      title: title,
      body: body?? null,
      starts_at: starts_at?? null,
      ends_at: ends_at?? null,
      created_by: userId,
    })
  .select("id")
  .single()
  if (error) throw new Error(error.message)
  return { id: (ins as { id: string }).id }
}

export async function deleteBusinessPromotion(input: { id: string }): Promise<{ ok: true }> {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await requireAuth()
  const { data: promo, error: pErr } = await supabase
  .from("business_promotions").select("business_id").eq("id", id).maybeSingle()
  if (pErr) throw new Error(pErr.message)
  if (!promo) throw new Error("Promotion not found")
  await assertOwnerOrAdmin(supabase, userId, (promo as { business_id: string }).business_id)
  const { error } = await supabase.from("business_promotions").delete().eq("id", id)
  if (error) throw new Error(error.message)
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
  const { business_id, message, contact_email, proof_url } = z.object({
    business_id: z.string().uuid(),
    message: z.string().max(1000).optional().nullable(),
    contact_email: z.string().email().max(200).optional().nullable(),
    proof_url: z.string().url().max(2000).optional().nullable(),
  }).parse(input)
  const { supabase, userId } = await requireAuth()
  // Prevent duplicate pending claim
  const { data: existing } = await supabase
  .from("business_claims")
  .select("id")
  .eq("business_id", business_id)
  .eq("claimant_id", userId)
  .eq("status", "pending")
  .maybeSingle()
  if (existing) return { id: (existing as { id: string }).id }
  const { data: ins, error } = await supabase
  .from("business_claims")
  .insert({
      business_id: business_id,
      claimant_id: userId,
      message: message?? null,
      contact_email: contact_email?? null,
      proof_url: proof_url?? null,
    })
  .select("id")
  .single()
  if (error) throw new Error(error.message)
  return { id: (ins as { id: string }).id }
}

export async function listMyBusinessClaims(): Promise<BusinessClaimDTO[]> {
  const { supabase, userId } = await requireAuth()
  const { data: rows, error } = await supabase
  .from("business_claims")
  .select("id,business_id,claimant_id,message,contact_email,proof_url,status,created_at,resolved_at")
  .eq("claimant_id", userId)
  .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  const claims = (rows?? []) as Array<Omit<BusinessClaimDTO, "business_name" | "business_slug" | "claimant_name">>
  const ids = Array.from(new Set(claims.map((c) => c.business_id)))
  if (!ids.length) return []
  const { data: bizRows } = await supabaseAdmin
  .from("businesses").select("id,name,slug").in("id", ids)
  const bMap = new Map((bizRows?? []).map((b: { id: string; name: string; slug: string }) => [b.id, b]))
  return claims.map((c) => {
    const b = bMap.get(c.business_id)
    return {...c, business_name: b?.name?? null, business_slug: b?.slug?? null, claimant_name: null }
  })
}

/* ---------- Admin ---------- */

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (data!== true) throw new Error("Forbidden")
}

export async function adminListBusinessClaims(input?: { status?: "pending" | "approved" | "rejected" | "all" }): Promise<BusinessClaimDTO[]> {
  const { userId } = await requireAuth()
  await assertAdmin(userId)
  const status = input?.status?? "pending"
  let q = supabaseAdmin
  .from("business_claims")
  .select("id,business_id,claimant_id,message,contact_email,proof_url,status,created_at,resolved_at")
  .order("created_at", { ascending: false })
  .limit(200)
  if (status!== "all") q = q.eq("status", status)
  const { data: rows, error } = await q
  if (error) throw new Error(error.message)
  const claims = (rows?? []) as Array<Omit<BusinessClaimDTO, "business_name" | "business_slug" | "claimant_name">>
  const bizIds = Array.from(new Set(claims.map((c) => c.business_id)))
  const userIds = Array.from(new Set(claims.map((c) => c.claimant_id)))
  const [bizRes, profRes] = await Promise.all([
    bizIds.length? supabaseAdmin.from("businesses").select("id,name,slug").in("id", bizIds) : Promise.resolve({ data: [] as Array<{ id: string; name: string; slug: string }> }),
    userIds.length? supabaseAdmin.from("profiles").select("user_id,display_name").in("user_id", userIds) : Promise.resolve({ data: [] as Array<{ user_id: string; display_name: string | null }> }),
  ])
  const bMap = new Map((bizRes.data?? []).map((b) => [b.id, b]))
  const pMap = new Map((profRes.data?? []).map((p) => [p.user_id, p.display_name]))
  return claims.map((c) => {
    const b = bMap.get(c.business_id)
    return {
    ...c,
      business_name: b?.name?? null,
      business_slug: b?.slug?? null,
      claimant_name: pMap.get(c.claimant_id)?? null,
    }
  })
}

export async function adminResolveBusinessClaim(input: {
  id: string
  action: "approve" | "reject"
  verify?: boolean
}): Promise<{ ok: true }> {
  const { id, action, verify } = z.object({
    id: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    verify: z.boolean().optional(),
  }).parse(input)
  const { userId } = await requireAuth()
  await assertAdmin(userId)
  const { data: claim, error: cErr } = await supabaseAdmin
  .from("business_claims")
  .select("id,business_id,claimant_id,status")
  .eq("id", id)
  .maybeSingle()
  if (cErr) throw new Error(cErr.message)
  if (!claim) throw new Error("Claim not found")
  const c = claim as { id: string; business_id: string; claimant_id: string; status: string }
  if (c.status!== "pending") throw new Error("Already resolved")

  if (action === "approve") {
    const update: { owner_id: string; verified?: boolean } = { owner_id: c.claimant_id }
    if (verify) update.verified = true
    const { error: bErr } = await supabaseAdmin
    .from("businesses").update(update).eq("id", c.business_id)
    if (bErr) throw new Error(bErr.message)
  }
  const { error: rErr } = await supabaseAdmin
  .from("business_claims")
  .update({
      status: action === "approve"? "approved" : "rejected",
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
    })
  .eq("id", id)
  if (rErr) throw new Error(rErr.message)

  // Notify claimant of the resolution
  const { data: biz } = await supabaseAdmin
  .from("businesses").select("name,slug").eq("id", c.business_id).maybeSingle()
  const bizName = (biz as { name?: string } | null)?.name?? "your business"
  const approved = action === "approve"
  await supabaseAdmin.from("notifications").insert({
    user_id: c.claimant_id,
    type: approved? "business_claim_approved" : "business_claim_rejected",
    title: approved? `Claim approved: ${bizName}` : `Claim rejected: ${bizName}`,
    body: approved
   ? "You can now manage this business — add photos, hours, and promotions."
      : "An admin reviewed your claim and could not approve it.",
  })

  return { ok: true }
}

export async function adminSetBusinessVerified(input: { business_id: string; verified: boolean }): Promise<{ ok: true }> {
  const { business_id, verified } = z.object({ business_id: z.string().uuid(), verified: z.boolean() }).parse(input)
  const { userId } = await requireAuth()
  await assertAdmin(userId)
  const { error } = await supabaseAdmin
  .from("businesses").update({ verified: verified }).eq("id", business_id)
  if (error) throw new Error(error.message)
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
