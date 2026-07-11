'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
export const REPORT_TARGET_TYPES = [
  "post",
  "post_comment",
  "marketplace_comment",
  "event_comment",
  "community_update_comment",
  "verified_update_comment",
  "marketplace_listing",
  "profile",
  "message",
] as const
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number]

export const REPORT_CATEGORIES = [
  "harassment",
  "spam",
  "illegal_content",
  "impersonation",
  "csam",
  "doxxing",
  "threats",
  "violence",
  "scam",
  "hate",
  "self_harm",
  "copyright",
  "other",
] as const
export type ReportCategory = (typeof REPORT_CATEGORIES)[number]

export const REPORT_CATEGORY_LABEL: Record<ReportCategory, string> = {
  harassment: "Harassment or bullying",
  spam: "Spam",
  illegal_content: "Illegal content",
  impersonation: "Impersonation",
  csam: "Sexual content involving a minor",
  doxxing: "Doxxing / private information",
  threats: "Threats or intimidation",
  violence: "Violence or gore",
  scam: "Scam or phishing",
  hate: "Hate speech",
  self_harm: "Self-harm or suicide",
  copyright: "Copyright / DMCA",
  other: "Other",
}

export type ModerationStatus = "visible" | "under_review" | "hidden" | "removed"

const TABLE_FOR_TARGET: Partial<Record<ReportTargetType, { table: string; ownerCol: string }>> = {
  post: { table: "posts", ownerCol: "user_id" },
  post_comment: { table: "post_comments", ownerCol: "user_id" },
  marketplace_comment: { table: "marketplace_comments", ownerCol: "user_id" },
  event_comment: { table: "event_comments", ownerCol: "user_id" },
  community_update_comment: { table: "community_update_comments", ownerCol: "user_id" },
  verified_update_comment: { table: "verified_update_comments", ownerCol: "user_id" },
  marketplace_listing: { table: "marketplace_listings", ownerCol: "seller_id" },
}

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error ||!user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

// ---------------------------------------------------------------
// Submit a report (polymorphic)
// ---------------------------------------------------------------
const submitReportSchema = z.object({
  target_type: z.enum(REPORT_TARGET_TYPES),
  target_id: z.string().uuid(),
  category: z.enum(REPORT_CATEGORIES),
  details: z.string().trim().max(1000).optional(),
  turnstile_token: z.string().max(2048).optional(),
})

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const siteKey = process.env.VITE_TURNSTILE_SITE_KEY
  if (!secret ||!siteKey) return true
  if (!token) return false
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    })
    const j = (await res.json()) as { success?: boolean }
    return j.success === true
  } catch {
    return false
  }
}

export async function submitReport(input: z.infer<typeof submitReportSchema>): Promise<{ ok: true }> {
  const data = submitReportSchema.parse(input)
  const { supabase, userId } = await getAuth()
  const ok = await verifyTurnstile(data.turnstile_token)
  if (!ok) throw new Error("Turnstile verification failed.")

  const { data: banned } = await supabase.rpc("is_user_banned", { _uid: userId })
  if (banned === true) throw new Error("Account restricted.")

  if (data.target_type === "post") {
    const { error } = await supabase.from("post_reports").insert({
      post_id: data.target_id,
      reporter_id: userId,
      reason: data.category,
      details: data.details?? null,
    })
    if (error && (error as { code?: string }).code!== "23505") throw new Error(error.message)
  } else if (data.target_type === "profile") {
    if (data.target_id === userId) throw new Error("You cannot report yourself.")
    const { error } = await supabase.from("profile_reports").insert({
      reported_user_id: data.target_id,
      reporter_id: userId,
      category: data.category,
      details: data.details?? null,
    })
    if (error && (error as { code?: string }).code!== "23505") throw new Error(error.message)
  } else if (data.target_type === "marketplace_listing") {
    const { error } = await supabase.from("marketplace_reports").insert({
      listing_id: data.target_id,
      reporter_id: userId,
      reason: data.category,
      details: data.details?? null,
    })
    if (error && (error as { code?: string }).code!== "23505") throw new Error(error.message)
  } else {
    const { error } = await supabase.from("comment_reports").insert({
      target_type: data.target_type,
      target_id: data.target_id,
      reporter_id: userId,
      category: data.category,
      details: data.details?? null,
    })
    if (error && (error as { code?: string }).code!== "23505") throw new Error(error.message)
  }

  return { ok: true }
}

// ---------------------------------------------------------------
// Admin / Moderator: list mod queue
// ---------------------------------------------------------------
export type ModQueueRow = {
  target_type: ReportTargetType
  target_id: string
  report_count: number
  high_severity: number
  first_reported: string
  last_reported: string
  categories: string[]
}

export async function listModQueue(input?: { limit?: number }): Promise<ModQueueRow[]> {
  const limit = Math.min(Math.max(input?.limit?? 100, 1), 500)
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")
  const { data: rows, error } = await supabase.rpc("mod_queue", { _limit: limit })
  if (error) throw new Error(error.message)
  return (rows?? []) as ModQueueRow[]
}

// ---------------------------------------------------------------
// Admin / Moderator: get full detail for a queue target
// ---------------------------------------------------------------
const targetDetailInput = z.object({
  target_type: z.enum(REPORT_TARGET_TYPES),
  target_id: z.string().uuid(),
})

export type ReportDetail = {
  id: string
  reporter_id: string
  reporter_name: string | null
  category: string
  details: string | null
  status: string
  created_at: string
}

export type TargetContent = {
  exists: boolean
  body?: string
  owner_id?: string
  owner_name?: string | null
  moderation_status?: ModerationStatus
  created_at?: string
}

export async function getModTargetDetail(input: z.infer<typeof targetDetailInput>): Promise<{ content: TargetContent; reports: ReportDetail[] }> {
  const data = targetDetailInput.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  let reports: ReportDetail[] = []
  if (data.target_type === "post") {
    const { data: rs } = await supabaseAdmin
   .from("post_reports")
   .select("id, reporter_id, reason, details, created_at")
   .eq("post_id", data.target_id)
    reports = (rs?? []).map((r) => ({
      id: r.id,
      reporter_id: r.reporter_id,
      reporter_name: null,
      category: r.reason,
      details: r.details,
      status: "open",
      created_at: r.created_at,
    }))
  } else if (data.target_type === "profile") {
    const { data: rs } = await supabaseAdmin
   .from("profile_reports")
   .select("id, reporter_id, category, details, status, created_at")
   .eq("reported_user_id", data.target_id)
    reports = (rs?? []) as ReportDetail[]
  } else if (data.target_type === "marketplace_listing") {
    const { data: rs } = await supabaseAdmin
   .from("marketplace_reports")
   .select("id, reporter_id, reason, details, status, created_at")
   .eq("listing_id", data.target_id)
    reports = (rs?? []).map((r) => ({
      id: r.id,
      reporter_id: r.reporter_id,
      reporter_name: null,
      category: r.reason,
      details: r.details,
      status: r.status,
      created_at: r.created_at,
    }))
  } else {
    const { data: rs } = await supabaseAdmin
   .from("comment_reports")
   .select("id, reporter_id, category, details, status, created_at")
   .eq("target_type", data.target_type)
   .eq("target_id", data.target_id)
    reports = (rs?? []) as ReportDetail[]
  }

  const ids = Array.from(new Set(reports.map((r) => r.reporter_id)))
  if (ids.length > 0) {
    const { data: profs } = await supabaseAdmin
   .from("profiles")
   .select("user_id, display_name")
   .in("user_id", ids)
    const map = new Map((profs?? []).map((p) => [p.user_id, p.display_name]))
    reports = reports.map((r) => ({...r, reporter_name: map.get(r.reporter_id)?? null }))
  }

  let content: TargetContent = { exists: false }
  const mapping = TABLE_FOR_TARGET[data.target_type]
  if (mapping) {
    const cols = mapping.table === "marketplace_listings"
     ? `title, description, ${mapping.ownerCol}, moderation_status, created_at`
      : `body, ${mapping.ownerCol}, moderation_status, created_at`
    const { data: row } = await (supabaseAdmin.from as (t: string) => ReturnType<typeof supabaseAdmin.from>)(mapping.table).select(cols).eq("id", data.target_id).maybeSingle() as { data: Record<string, unknown> | null }
    if (row) {
      content = {
        exists: true,
        body: (row.body as string | undefined)?? (row.title as string | undefined),
        owner_id: row[mapping.ownerCol] as string,
        moderation_status: row.moderation_status as ModerationStatus,
        created_at: row.created_at as string,
      }
      if (content.owner_id) {
        const { data: p } = await supabaseAdmin.from("profiles").select("display_name").eq("user_id", content.owner_id).maybeSingle()
        content.owner_name = p?.display_name?? null
      }
    }
  } else if (data.target_type === "profile") {
    const { data: p } = await supabaseAdmin
   .from("profiles")
   .select("user_id, display_name, bio, suspended_until, banned_at")
   .eq("user_id", data.target_id)
   .maybeSingle()
    if (p) {
      content = {
        exists: true,
        body: p.bio?? "",
        owner_id: p.user_id,
        owner_name: p.display_name,
      }
    }
  }

  return { content, reports }
}

// ---------------------------------------------------------------
// Admin / Moderator: take a moderation action
// ---------------------------------------------------------------
const actionInput = z.object({
  target_type: z.enum(REPORT_TARGET_TYPES),
  target_id: z.string().uuid(),
  action: z.enum([
    "hide",
    "unhide",
    "remove",
    "restore",
    "dismiss_report",
    "suspend",
    "unsuspend",
    "ban",
    "unban",
    "warn",
  ]),
  reason: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
  suspend_hours: z.number().int().min(1).max(24 * 365).optional(),
  affected_user_id: z.string().uuid().optional(),
})

export async function takeModAction(input: z.infer<typeof actionInput>): Promise<{ ok: true }> {
  const data = actionInput.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")

  if (data.action === "ban" || data.action === "unban") {
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
    if (isAdmin!== true) throw new Error("Admin only")
  }

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const mapping = TABLE_FOR_TARGET[data.target_type]

  let affectedUserId = data.affected_user_id?? null

  if (data.action === "hide" || data.action === "unhide" || data.action === "remove" || data.action === "restore") {
    if (!mapping && data.target_type!== "profile") throw new Error("Action not supported for this target type")
    if (mapping) {
      const newStatus: ModerationStatus =
        data.action === "remove"
         ? "removed"
          : data.action === "hide"
           ? "hidden"
            : "visible"
      const update: Record<string, unknown> = { moderation_status: newStatus }
      if (mapping.table === "posts") update.hidden = newStatus!== "visible"
      const { data: row, error } = await (supabaseAdmin.from as (t: string) => ReturnType<typeof supabaseAdmin.from>)(mapping.table)
     .update(update as never)
     .eq("id", data.target_id)
     .select(mapping.ownerCol)
     .maybeSingle() as { data: Record<string, string> | null; error: { message: string } | null }
      if (error) throw new Error(error.message)
      affectedUserId = (row?.[mapping.ownerCol] as string | undefined)?? affectedUserId
    }
  } else if (data.action === "suspend") {
    affectedUserId = data.target_type === "profile"? data.target_id : affectedUserId
    if (!affectedUserId) throw new Error("Missing user to suspend")
    const until = new Date(Date.now() + (data.suspend_hours?? 24) * 3600_000).toISOString()
    const { error } = await supabaseAdmin.from("profiles").update({ suspended_until: until }).eq("user_id", affectedUserId)
    if (error) throw new Error(error.message)
  } else if (data.action === "unsuspend") {
    affectedUserId = data.target_type === "profile"? data.target_id : affectedUserId
    if (!affectedUserId) throw new Error("Missing user")
    const { error } = await supabaseAdmin.from("profiles").update({ suspended_until: null }).eq("user_id", affectedUserId)
    if (error) throw new Error(error.message)
  } else if (data.action === "ban") {
    affectedUserId = data.target_type === "profile"? data.target_id : affectedUserId
    if (!affectedUserId) throw new Error("Missing user to ban")
    const { error } = await supabaseAdmin
   .from("profiles")
   .update({ banned_at: new Date().toISOString(), ban_reason: data.reason?? null })
   .eq("user_id", affectedUserId)
    if (error) throw new Error(error.message)
  } else if (data.action === "unban") {
    affectedUserId = data.target_type === "profile"? data.target_id : affectedUserId
    if (!affectedUserId) throw new Error("Missing user")
    const { error } = await supabaseAdmin
   .from("profiles")
   .update({ banned_at: null, ban_reason: null })
   .eq("user_id", affectedUserId)
    if (error) throw new Error(error.message)
  } else if (data.action === "dismiss_report") {
    if (data.target_type === "profile") {
      await supabaseAdmin
     .from("profile_reports")
     .update({ status: "dismissed", resolved_at: new Date().toISOString(), resolved_by: userId })
     .eq("reported_user_id", data.target_id)
     .eq("status", "open")
    } else if (data.target_type === "marketplace_listing") {
      await supabaseAdmin
     .from("marketplace_reports")
     .update({ status: "dismissed", resolved_at: new Date().toISOString(), resolved_by: userId })
     .eq("listing_id", data.target_id)
     .eq("status", "open")
    } else if (data.target_type!== "post") {
      await supabaseAdmin
     .from("comment_reports")
     .update({ status: "dismissed", resolved_at: new Date().toISOString(), resolved_by: userId })
     .eq("target_type", data.target_type)
     .eq("target_id", data.target_id)
     .eq("status", "open")
    }
  }

  if (data.action === "remove" || data.action === "hide") {
    if (data.target_type === "profile") {
      await supabaseAdmin
     .from("profile_reports")
     .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: userId })
     .eq("reported_user_id", data.target_id)
     .eq("status", "open")
    } else if (data.target_type === "marketplace_listing") {
      await supabaseAdmin
     .from("marketplace_reports")
     .update({ status: "actioned", resolved_at: new Date().toISOString(), resolved_by: userId })
     .eq("listing_id", data.target_id)
     .eq("status", "open")
    } else if (data.target_type!== "post") {
      await supabaseAdmin
     .from("comment_reports")
     .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: userId })
     .eq("target_type", data.target_type)
     .eq("target_id", data.target_id)
     .eq("status", "open")
    }
  }

  const { error: logErr } = await supabase.from("moderation_actions").insert({
    actor_id: userId,
    action: data.action,
    target_type: data.target_type,
    target_id: data.target_id,
    affected_user_id: affectedUserId,
    reason: data.reason?? null,
    notes: data.notes?? null,
  })
  if (logErr) console.warn("[mod] audit insert failed", logErr.message)

  return { ok: true }
}

// ---------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------
export type AuditEntry = {
  id: string
  actor_id: string | null
  actor_name: string | null
  action: string
  target_type: string | null
  target_id: string | null
  affected_user_id: string | null
  affected_user_name: string | null
  reason: string | null
  notes: string | null
  created_at: string
}

export async function listAuditLog(input?: { limit?: number }): Promise<AuditEntry[]> {
  const limit = Math.min(Math.max(input?.limit?? 100, 1), 500)
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data: rows, error } = await supabaseAdmin
 .from("moderation_actions")
 .select("id, actor_id, action, target_type, target_id, affected_user_id, reason, notes, created_at")
 .order("created_at", { ascending: false })
 .limit(limit)
  if (error) throw new Error(error.message)
  const ids = Array.from(new Set([
   ...((rows?? []).map((r) => r.actor_id).filter(Boolean) as string[]),
   ...((rows?? []).map((r) => r.affected_user_id).filter(Boolean) as string[]),
  ]))
  const { data: profs } = ids.length
   ? await supabaseAdmin.from("profiles").select("user_id, display_name").in("user_id", ids)
    : { data: [] }
  const nameMap = new Map((profs?? []).map((p) => [p.user_id, p.display_name]))
  return (rows?? []).map((r) => ({
   ...r,
    actor_name: r.actor_id? nameMap.get(r.actor_id)?? null : null,
    affected_user_name: r.affected_user_id? nameMap.get(r.affected_user_id)?? null : null,
  })) as AuditEntry[]
}

// ---------------------------------------------------------------
// Appeals
// ---------------------------------------------------------------
const appealSchema = z.object({
  action_id: z.string().uuid().optional(),
  target_type: z.enum(REPORT_TARGET_TYPES).optional(),
  target_id: z.string().uuid().optional(),
  message: z.string().trim().min(10).max(2000),
})

export async function submitAppeal(input: z.infer<typeof appealSchema>): Promise<{ ok: true; id: string }> {
  const data = appealSchema.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: row, error } = await supabase
 .from("moderation_appeals")
 .insert({
    appellant_id: userId,
    action_id: data.action_id?? null,
    target_type: data.target_type?? null,
    target_id: data.target_id?? null,
    message: data.message,
  })
 .select("id")
 .maybeSingle()
  if (error) throw new Error(error.message)
  return { ok: true, id: row!.id }
}

export type AppealRow = {
  id: string
  appellant_id: string
  appellant_name: string | null
  action_id: string | null
  target_type: string | null
  target_id: string | null
  message: string
  status: "pending" | "approved" | "denied"
  reviewer_id: string | null
  reviewer_notes: string | null
  reviewed_at: string | null
  created_at: string
}

export async function listAppeals(input?: { status?: "pending" | "approved" | "denied" | "all" }): Promise<AppealRow[]> {
  const status = input?.status?? "pending"
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  let q = supabaseAdmin
 .from("moderation_appeals")
 .select("id, appellant_id, action_id, target_type, target_id, message, status, reviewer_id, reviewer_notes, reviewed_at, created_at")
 .order("created_at", { ascending: false })
 .limit(200)
  if (status!== "all") q = q.eq("status", status)
  const { data: rows, error } = await q
  if (error) throw new Error(error.message)
  const ids = Array.from(new Set((rows?? []).map((r) => r.appellant_id)))
  const { data: profs } = ids.length
   ? await supabaseAdmin.from("profiles").select("user_id, display_name").in("user_id", ids)
    : { data: [] }
  const map = new Map((profs?? []).map((p) => [p.user_id, p.display_name]))
  return (rows?? []).map((r) => ({...r, appellant_name: map.get(r.appellant_id)?? null })) as AppealRow[]
}

export type MyAppealRow = AppealRow
export async function listMyAppeals(): Promise<MyAppealRow[]> {
  const { supabase, userId } = await getAuth()
  const { data, error } = await supabase
 .from("moderation_appeals")
 .select("id, appellant_id, action_id, target_type, target_id, message, status, reviewer_id, reviewer_notes, reviewed_at, created_at")
 .eq("appellant_id", userId)
 .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data?? []).map((r) => ({...r, appellant_name: null })) as MyAppealRow[]
}

const resolveAppealSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "denied"]),
  notes: z.string().trim().max(1000).optional(),
})

export async function resolveAppeal(input: z.infer<typeof resolveAppealSchema>): Promise<{ ok: true }> {
  const data = resolveAppealSchema.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")
  const { error } = await supabase
 .from("moderation_appeals")
 .update({
    status: data.decision,
    reviewer_id: userId,
    reviewer_notes: data.notes?? null,
    reviewed_at: new Date().toISOString(),
  })
 .eq("id", data.id)
  if (error) throw new Error(error.message)

  await supabase.from("moderation_actions").insert({
    actor_id: userId,
    action: data.decision === "approved"? "resolve_appeal" : "deny_appeal",
    target_type: null,
    target_id: null,
    affected_user_id: null,
    reason: null,
    notes: data.notes?? null,
    metadata: { appeal_id: data.id },
  })

  return { ok: true }
}

// ---------------------------------------------------------------
// Check current user's role + ban state (for UI gating)
// ---------------------------------------------------------------
export async function getMyModerationContext(): Promise<{ is_admin: boolean; is_moderator: boolean; banned: boolean; suspended_until: string | null }> {
  const { supabase, userId } = await getAuth()
  const [{ data: isAdmin }, { data: isMod }, { data: prof }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "moderator" }),
    supabase.from("profiles").select("banned_at, suspended_until").eq("user_id", userId).maybeSingle(),
  ])
  return {
    is_admin: isAdmin === true,
    is_moderator: isMod === true,
    banned:!!prof?.banned_at,
    suspended_until: prof?.suspended_until?? null,
  }
}

// ---------------------------------------------------------------
// AI classifier (best-effort, optional)
// ---------------------------------------------------------------
const classifyInput = z.object({
  target_type: z.enum(REPORT_TARGET_TYPES),
  target_id: z.string().uuid(),
})

export async function aiClassifyContent(input: z.infer<typeof classifyInput>): Promise<{ flagged: boolean; category?: ReportCategory; score?: number; rationale?: string }> {
  const data = classifyInput.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")

  const apiKey = process.env.LOVABLE_API_KEY
  if (!apiKey) return { flagged: false, rationale: "LOVABLE_API_KEY not configured" }

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const mapping = TABLE_FOR_TARGET[data.target_type]
  if (!mapping) return { flagged: false, rationale: "Unsupported target" }

  const cols = mapping.table === "marketplace_listings"? "title, description" : "body"
  const { data: row } = await (supabaseAdmin.from as (t: string) => ReturnType<typeof supabaseAdmin.from>)(mapping.table).select(cols).eq("id", data.target_id).maybeSingle() as { data: Record<string, string> | null }
  if (!row) return { flagged: false, rationale: "Content not found" }
  const text = (row.body?? `${row.title?? ""}\n${row.description?? ""}`).slice(0, 3000)

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Classify user-generated content for a community platform. Respond ONLY with JSON: {\"flagged\":bool,\"category\":one of [harassment,spam,illegal_content,impersonation,csam,doxxing,threats,violence,scam,hate,self_harm,copyright,other,none],\"score\":0-1,\"rationale\":string}. Be conservative: flag only clear violations.",
          },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { flagged: false, rationale: `AI gateway ${res.status}: ${t.slice(0, 120)}` }
    }
    const j = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const content = j.choices?.[0]?.message?.content?? "{}"
    const parsed = JSON.parse(content) as { flagged?: boolean; category?: string; score?: number; rationale?: string }
    const flagged = parsed.flagged === true && parsed.category!== "none"
    if (flagged) {
      await supabase.from("moderation_actions").insert({
        actor_id: userId,
        action: "ai_flag",
        target_type: data.target_type,
        target_id: data.target_id,
        reason: parsed.category?? "other",
        notes: parsed.rationale?.slice(0, 1000)?? null,
        metadata: { score: parsed.score?? null },
      })
      await (supabaseAdmin.from as (t: string) => ReturnType<typeof supabaseAdmin.from>)(mapping.table).update({ moderation_status: "under_review" } as never).eq("id", data.target_id)
    }
    return {
      flagged,
      category: (parsed.category && parsed.category!== "none"? (parsed.category as ReportCategory) : undefined),
      score: parsed.score,
      rationale: parsed.rationale,
    }
  } catch (e) {
    return { flagged: false, rationale: e instanceof Error? e.message : "AI error" }
  }
}

// ---------------------------------------------------------------
// Promote / demote moderator (admin only)
// ---------------------------------------------------------------
const modToggleSchema = z.object({ user_id: z.string().uuid(), make_moderator: z.boolean() })

export async function adminToggleModerator(input: z.infer<typeof modToggleSchema>): Promise<{ ok: true; is_moderator: boolean }> {
  const data = modToggleSchema.parse(input)
  const { supabase, userId } = await getAuth()
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (isAdmin!== true) throw new Error("Admin only")
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  if (data.make_moderator) {
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.user_id, role: "moderator" })
    if (error && (error as { code?: string }).code!== "23505") throw new Error(error.message)
    return { ok: true, is_moderator: true }
  }
  const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", "moderator")
  if (error) throw new Error(error.message)
  return { ok: true, is_moderator: false }
}

export async function adminListModeratorIds(): Promise<string[]> {
  const { supabase, userId } = await getAuth()
  const { data: ok } = await supabase.rpc("is_mod_or_admin", { _uid: userId })
  if (ok!== true) throw new Error("Not authorized")
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data, error } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "moderator")
  if (error) throw new Error(error.message)
  return (data?? []).map((r) => r.user_id)
}
