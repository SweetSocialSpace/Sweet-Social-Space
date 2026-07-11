'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'

export type MarketplaceListingDTO = {
  id: string
  seller_id: string | null
  title: string
  description: string | null
  price_cents: number
  currency: string
  condition: "new" | "like_new" | "used" | "for_parts"
  category: string
  city: string | null
  state_code: string | null
  latitude: number | null
  longitude: number | null
  image_url: string | null
  status: "active" | "sold" | "removed"
  created_at: string
}

export type MarketplacePhotoDTO = {
  id: string
  listing_id: string
  url: string
  caption: string | null
  sort_order: number
}

export type MarketplaceCommentDTO = {
  id: string
  listing_id: string
  body: string
  created_at: string
  display_name: string | null
}

const SELECT = "id,seller_id,title,description,price_cents,currency,condition,category,city,state_code,latitude,longitude,image_url,status,created_at"

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

export async function listMarketplace(input?: { limit?: number; category?: string; q?: string; includeSold?: boolean; scope?: Partial<LocationFilter> }): Promise<MarketplaceListingDTO[]> {
  const limit = Math.min(Math.max(input?.limit?? 24, 1), 100)
  const category = input?.category
  const q = (input?.q?? "").trim().slice(0, 100)
  const includeSold = !!input?.includeSold
  const scope = normalizeScopeInput(scopeInput.parse(input?.scope?? {}))

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  let query = supabaseAdmin
  .from("marketplace_listings")
  .select(SELECT)
  .not("seller_id", "is", null)
  .order("created_at", { ascending: false })
  if (includeSold) {
    query = query.in("status", ["active", "sold"])
  } else {
    query = query.eq("status", "active")
  }
  if (category) query = query.eq("category", category)
  if (q) {
    const safe = q.replace(/[^A-Za-z0-9 \-]/g, " ").trim()
    if (safe) {
      query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`)
    }
  }
  if (includeSold) {
    query = query.in("status", ["active", "sold"])
  } else {
    query = query.eq("status", "active")
  }

  const radius = SCOPE_RADIUS_MILES[scope.scope]
  if (radius!= null && scope.lat!= null && scope.lng!= null) {
    const b = bboxForRadius(scope.lat, scope.lng, radius)
    query = query.gte("latitude", b.minLat).lte("latitude", b.maxLat).gte("longitude", b.minLng).lte("longitude", b.maxLng)
  } else if (scope.scope === "state" && scope.state_code) {
    query = query.eq("state_code", scope.state_code.toUpperCase())
  }

  const { data: rows, error } = await query.limit(Math.max(limit * 3, 30))
  if (error) throw new Error(error.message)
  const filtered = applyScope((rows?? []) as MarketplaceListingDTO[], scope)
  return filtered.slice(0, limit)
}

export async function getMarketplaceListing(input: { id: string }): Promise<{
  listing: MarketplaceListingDTO
  seller_name: string | null
  photos: MarketplacePhotoDTO[]
  comments: MarketplaceCommentDTO[]
  related: MarketplaceListingDTO[]
} | null> {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  
  const { data: listing, error } = await supabaseAdmin
  .from("marketplace_listings")
  .select(SELECT)
  .eq("id", id)
  .maybeSingle()
  if (error) throw new Error(error.message)
  if (!listing) return null
  const l = listing as MarketplaceListingDTO
  if (l.status === "removed") return null

  const [commentsRes, relatedRes, sellerRes, photosRes] = await Promise.all([
    supabaseAdmin
    .from("marketplace_comments")
    .select("id,listing_id,user_id,body,created_at")
    .eq("listing_id", id)
    .order("created_at", { ascending: false })
    .limit(100),
    supabaseAdmin
    .from("marketplace_listings")
    .select(SELECT)
    .eq("category", l.category)
    .eq("status", "active")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(4),
    l.seller_id
      ? supabaseAdmin.from("profiles").select("display_name").eq("user_id", l.seller_id).maybeSingle()
      : Promise.resolve({ data: null, error: null as Error | null }),
    supabaseAdmin
    .from("marketplace_listing_photos")
    .select("id,listing_id,url,caption,sort_order")
    .eq("listing_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true }),
  ])
  if (commentsRes.error) throw new Error(commentsRes.error.message)
  if (relatedRes.error) throw new Error(relatedRes.error.message)

  const raw = (commentsRes.data?? []) as Array<{ id: string; listing_id: string; user_id: string; body: string; created_at: string }>
  const userIds = Array.from(new Set(raw.map((c) => c.user_id)))
  let nameMap: Record<string, string | null> = {}
  if (userIds.length) {
    const { data: profs } = await supabaseAdmin
    .from("profiles")
    .select("user_id,display_name")
    .in("user_id", userIds)
    nameMap = Object.fromEntries(
      (profs?? []).map((p: { user_id: string; display_name: string | null }) => [p.user_id, p.display_name]),
    )
  }

  return {
    listing: l,
    seller_name: (sellerRes.data as { display_name: string | null } | null)?.display_name?? null,
    photos: (photosRes.data?? []) as MarketplacePhotoDTO[],
    comments: raw.map(({ user_id, ...c }) => ({ ...c, display_name: nameMap[user_id]?? null })),
    related: (relatedRes.data?? []) as MarketplaceListingDTO[],
  }
}

const CATEGORY_KEYS = ["furniture","tools","vehicles","electronics","kids","clothing","home","sports","free","other"] as const
const CONDITION_KEYS = ["new","like_new","used","for_parts"] as const

const listingInput = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(8000).optional().nullable(),
  price_cents: z.number().int().min(0).max(100_000_000),
  currency: z.string().trim().length(3).default("USD"),
  condition: z.enum(CONDITION_KEYS),
  category: z.enum(CATEGORY_KEYS),
  city: z.string().trim().max(120).optional().nullable(),
  state_code: z.string().trim().max(8).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  image_url: z.string().trim().url().max(2000).optional().nullable(),
})

export async function createListing(input: z.infer<typeof listingInput>): Promise<{ id: string }> {
  const data = listingInput.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: row, error } = await supabase
  .from("marketplace_listings")
  .insert({
    seller_id: userId,
    title: data.title,
    description: data.description?? null,
    price_cents: data.price_cents,
    currency: data.currency.toUpperCase(),
    condition: data.condition,
    category: data.category,
    city: data.city?? null,
    state_code: data.state_code ? data.state_code.toUpperCase() : null,
    latitude: data.latitude?? null,
    longitude: data.longitude?? null,
    image_url: data.image_url?? null,
    status: "active",
  })
  .select("id")
  .single()
  if (error) throw new Error(error.message)
  return { id: (row as { id: string }).id }
}

export async function updateListing(input: Partial<z.infer<typeof listingInput>> & { id: string }): Promise<{ ok: true }> {
  const { id, ...rest } = listingInput.partial().extend({ id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await getAuth()
  const patch: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined) continue
    patch[k] = (k === "state_code" || k === "currency") && typeof v === "string" ? v.toUpperCase() : v
  }
  if (Object.keys(patch).length === 0) return { ok: true }
  const { error } = await supabase
  .from("marketplace_listings")
  .update(patch as never)
  .eq("id", id)
  .eq("seller_id", userId)
  if (error) throw new Error(error.message)
  return { ok: true }
}

async function assertListingOwner(supabase: any, userId: string, listingId: string) {
  const { data: listing, error } = await supabase
  .from("marketplace_listings").select("seller_id").eq("id", listingId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!listing || (listing as { seller_id: string }).seller_id!== userId) {
    throw new Error("Not allowed")
  }
}

export async function addListingPhoto(input: {
  listing_id: string
  url: string
  caption?: string | null
  sort_order?: number
}): Promise<{ id: string }> {
  const data = z.object({
    listing_id: z.string().uuid(),
    url: z.string().trim().url().max(2000),
    caption: z.string().trim().max(280).optional().nullable(),
    sort_order: z.number().int().min(0).max(99).optional(),
  }).parse(input)
  const { supabase, userId } = await getAuth()
  await assertListingOwner(supabase, userId, data.listing_id)
  const { data: row, error } = await supabase
  .from("marketplace_listing_photos")
  .insert({
    listing_id: data.listing_id,
    url: data.url,
    caption: data.caption?? null,
    sort_order: data.sort_order?? 0,
    created_by: userId,
  })
  .select("id")
  .single()
  if (error) throw new Error(error.message)
  return { id: (row as { id: string }).id }
}

export async function deleteListingPhoto(input: { id: string }): Promise<{ ok: true }> {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await getAuth()
  const { data: photo, error: pErr } = await supabase
  .from("marketplace_listing_photos").select("listing_id").eq("id", id).maybeSingle()
  if (pErr) throw new Error(pErr.message)
  if (!photo) throw new Error("Photo not found")
  await assertListingOwner(supabase, userId, (photo as { listing_id: string }).listing_id)
  const { error } = await supabase
  .from("marketplace_listing_photos").delete().eq("id", id)
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function setListingStatus(input: {
  id: string
  status: "active" | "sold" | "removed"
}): Promise<{ ok: true }> {
  const data = z.object({
    id: z.string().uuid(),
    status: z.enum(["active", "sold", "removed"]),
  }).parse(input)
  const { supabase, userId } = await getAuth()
  const { error } = await supabase
  .from("marketplace_listings")
  .update({ status: data.status })
  .eq("id", data.id)
  .eq("seller_id", userId)
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function reportListing(input: {
  listing_id: string
  reason: "fraud" | "spam" | "prohibited" | "duplicate" | "other"
  details?: string | null
}): Promise<{ ok: true }> {
  const data = z.object({
    listing_id: z.string().uuid(),
    reason: z.enum(["fraud", "spam", "prohibited", "duplicate", "other"]),
    details: z.string().max(1000).optional().nullable(),
  }).parse(input)
  const { supabase, userId } = await getAuth()
  const { error } = await supabase.from("marketplace_reports").insert({
    listing_id: data.listing_id,
    reporter_id: userId,
    reason: data.reason,
    details: data.details?? null,
  })
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function toggleSaveListing(input: { listing_id: string }): Promise<{ saved: boolean }> {
  const { listing_id } = z.object({ listing_id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await getAuth()
  const existing = await supabase
  .from("marketplace_saves")
  .select("listing_id")
  .eq("listing_id", listing_id)
  .eq("user_id", userId)
  .maybeSingle()
  if (existing.data) {
    const { error } = await supabase
    .from("marketplace_saves")
    .delete()
    .eq("listing_id", listing_id)
    .eq("user_id", userId)
    if (error) throw new Error(error.message)
    return { saved: false }
  }
  const { error } = await supabase
  .from("marketplace_saves")
  .insert({ listing_id, user_id: userId })
  if (error) throw new Error(error.message)
  return { saved: true }
}

export async function isListingSaved(input: { listing_id: string }): Promise<{ saved: boolean }> {
  const { listing_id } = z.object({ listing_id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await getAuth()
  const { data: row } = await supabase
  .from("marketplace_saves")
  .select("listing_id")
  .eq("listing_id", listing_id)
  .eq("user_id", userId)
  .maybeSingle()
  return { saved: !!row }
}

export async function listMySavedListings(): Promise<MarketplaceListingDTO[]> {
  const { supabase, userId } = await getAuth()
  const { data: saves, error } = await supabase
  .from("marketplace_saves")
  .select("listing_id, created_at")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(200)
  if (error) throw new Error(error.message)
  const ids = (saves?? []).map((s: { listing_id: string }) => s.listing_id)
  if (!ids.length) return []
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data: rows } = await supabaseAdmin
  .from("marketplace_listings")
  .select(SELECT)
  .in("id", ids)
  return (rows?? []) as MarketplaceListingDTO[]
}

export type SellerProfileDTO = {
  user_id: string
  display_name: string | null
  joined: string | null
  active: MarketplaceListingDTO[]
  sold: MarketplaceListingDTO[]
}

export async function getSellerProfile(input: { user_id: string }): Promise<SellerProfileDTO | null> {
  const { user_id } = z.object({ user_id: z.string().uuid() }).parse(input)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const [profRes, listRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("user_id,display_name,created_at").eq("user_id", user_id).maybeSingle(),
    supabaseAdmin
    .from("marketplace_listings")
    .select(SELECT)
    .eq("seller_id", user_id)
    .in("status", ["active", "sold"])
    .order("created_at", { ascending: false })
    .limit(100),
  ])
  const prof = profRes.data as { user_id: string; display_name: string | null; created_at: string } | null
  if (!prof) return null
  const rows = (listRes.data?? []) as MarketplaceListingDTO[]
  return {
    user_id: prof.user_id,
    display_name: prof.display_name,
    joined: prof.created_at,
    active: rows.filter((r) => r.status === "active"),
    sold: rows.filter((r) => r.status === "sold"),
  }
}

export async function getOrCreateMarketplaceDm(input: {
  listing_id: string
  intro?: string
}): Promise<{ conversation_id: string }> {
  const data = z.object({
    listing_id: z.string().uuid(),
    intro: z.string().max(500).optional(),
  }).parse(input)
  const { supabase, userId } = await getAuth()
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: listing } = await supabaseAdmin
  .from("marketplace_listings")
  .select("id,seller_id,title")
  .eq("id", data.listing_id)
  .maybeSingle()
  if (!listing) throw new Error("Listing not found")
  const sellerId = (listing as { seller_id: string | null; title: string }).seller_id
  if (!sellerId) throw new Error("Listing has no seller")
  if (sellerId === userId) throw new Error("You can't message yourself")

  const { data: mine } = await supabase
  .from("conversation_members")
  .select("conversation_id")
  .eq("user_id", userId)
  const myIds = (mine?? []).map((m: { conversation_id: string }) => m.conversation_id)
  let existingId: string | null = null
  if (myIds.length) {
    const { data: shared } = await supabaseAdmin
    .from("conversation_members")
    .select("conversation_id")
    .in("conversation_id", myIds)
    .eq("user_id", sellerId)
    const sharedIds = (shared?? []).map((s: { conversation_id: string }) => s.conversation_id)
    if (sharedIds.length) {
      const { data: dms } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .in("id", sharedIds)
      .eq("type", "dm")
      .limit(1)
      if (dms && dms.length) existingId = dms[0].id
    }
  }
  if (existingId) return { conversation_id: existingId }

  const { data: conv, error: convErr } = await supabaseAdmin
  .from("conversations")
  .insert({ type: "dm", created_by: userId })
  .select("id")
  .single()
  if (convErr || !conv) throw new Error(convErr?.message?? "Failed to create chat")
  const cid = (conv as { id: string }).id

  const { error: memErr } = await supabaseAdmin
  .from("conversation_members")
  .insert([
    { conversation_id: cid, user_id: userId },
    { conversation_id: cid, user_id: sellerId },
  ])
  if (memErr) throw new Error(memErr.message)

  const { data: buyer } = await supabaseAdmin
  .from("profiles")
  .select("display_name")
  .eq("user_id", userId)
  .maybeSingle()
  const buyerName = (buyer as { display_name: string | null } | null)?.display_name?? "A neighbor"
  const title = `${buyerName} is asking about "${(listing as { title: string }).title}"`
  await supabaseAdmin.from("notifications").insert({
    user_id: sellerId,
    type: "marketplace_contact",
    conversation_id: cid,
    title: title.slice(0, 200),
    body: (data.intro?? "Tap to open the chat.").slice(0, 500),
  })

  return { conversation_id: cid }
}

export type ReportDTO = {
  id: string
  listing_id: string
  listing_title: string | null
  listing_status: string | null
  reporter_id: string
  reporter_name: string | null
  reason: string
  details: string | null
  status: "open" | "dismissed" | "actioned"
  created_at: string
}

export async function adminListReports(input?: { status?: "open" | "dismissed" | "actioned" }): Promise<ReportDTO[]> {
  const status = input?.status?? "open"
  const { userId } = await getAuth()
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (!isAdmin) throw new Error("Forbidden")
  const { data: rows, error } = await supabaseAdmin
  .from("marketplace_reports")
  .select("id,listing_id,reporter_id,reason,details,status,created_at")
  .eq("status", status)
  .order("created_at", { ascending: false })
  .limit(200)
  if (error) throw new Error(error.message)
  const reports = (rows?? []) as Array<{ id: string; listing_id: string; reporter_id: string; reason: string; details: string | null; status: "open" | "dismissed" | "actioned"; created_at: string }>
  const listingIds = Array.from(new Set(reports.map((r) => r.listing_id)))
  const reporterIds = Array.from(new Set(reports.map((r) => r.reporter_id)))
  const [listingsRes, profilesRes] = await Promise.all([
    listingIds.length
      ? supabaseAdmin.from("marketplace_listings").select("id,title,status").in("id", listingIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; status: string }> }),
    reporterIds.length
      ? supabaseAdmin.from("profiles").select("user_id,display_name").in("user_id", reporterIds)
      : Promise.resolve({ data: [] as Array<{ user_id: string; display_name: string | null }> }),
  ])
  const lMap = new Map((listingsRes.data?? []).map((l) => [l.id, l]))
  const pMap = new Map((profilesRes.data?? []).map((p) => [p.user_id, p.display_name]))
  return reports.map((r) => {
    const l = lMap.get(r.listing_id)
    return {
      ...r,
      listing_title: l?.title?? null,
      listing_status: l?.status?? null,
      reporter_name: pMap.get(r.reporter_id)?? null,
    }
  })
}

export async function adminResolveReport(input: {
  id: string
  action: "dismiss" | "remove_listing"
}): Promise<{ ok: true }> {
  const data = z.object({
    id: z.string().uuid(),
    action: z.enum(["dismiss", "remove_listing"]),
  }).parse(input)
  const { userId } = await getAuth()
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (!isAdmin) throw new Error("Forbidden")
  const { data: report } = await supabaseAdmin
  .from("marketplace_reports")
  .select("id,listing_id")
  .eq("id", data.id)
  .maybeSingle()
  if (!report) throw new Error("Report not found")
  if (data.action === "remove_listing") {
    await supabaseAdmin
    .from("marketplace_listings")
    .update({ status: "removed" })
    .eq("id", (report as { listing_id: string }).listing_id)
  }
  await supabaseAdmin
  .from("marketplace_reports")
  .update({
    status: data.action === "dismiss" ? "dismissed" : "actioned",
    resolved_by: userId,
    resolved_at: new Date().toISOString(),
  })
  .eq("id", data.id)
  return { ok: true }
}

export function formatPrice(cents: number, currency = "USD"): string {
  if (cents === 0) return "Free"
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100)
}

export const CATEGORY_LABELS: Record<string, string> = {
  furniture: "Furniture",
  tools: "Tools",
  vehicles: "Vehicles",
  electronics: "Electronics",
  kids: "Kids",
  clothing: "Clothing",
  home: "Home",
  sports: "Sports",
  free: "Free",
  other: "Other",
}

export const CATEGORY_EMOJI: Record<string, string> = {
  furniture: "🛋",
  tools: "🔧",
  vehicles: "🚗",
  electronics: "💻",
  kids: "🧸",
  clothing: "👕",
  home: "🏠",
  sports: "⚽",
  free: "🎁",
  other: "📦",
}
