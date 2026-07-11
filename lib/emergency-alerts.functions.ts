'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'

// Admin CMS for emergency alerts. Posts to the 95122 feed as Emergency Bot
// when published. Drafts/unpublished entries stay in DB but hidden from public.

const BOT_USER_ID = "b0700000-0000-0000-0000-000000911911"
const ZIP = "95122"
const ZIP_LAT = 37.3382
const ZIP_LNG = -121.8413

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error ||!user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
  if (error || data!== true) throw new Error("Admin only")
}

function buildBody(d: { source: string; title: string; details?: string; source_url?: string }) {
  const head = `🚨 ${d.source} Alert: ${d.title}`.slice(0, 240)
  const extra = d.details? `\n\n${d.details}` : ""
  const src = d.source_url? `\n\nSource: ${d.source_url}` : ""
  return `${head}${extra}${src}`.slice(0, 500)
}

const baseSchema = z.object({
  source: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(200),
  details: z.string().trim().max(400).optional().or(z.literal("")),
  source_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("published"),
})

export type AlertStatus = "draft" | "published" | "unpublished"

export type AdminAlertDTO = {
  id: string
  title: string
  body: string
  source_label: string | null
  source_url: string | null
  status: AlertStatus
  is_automated: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

// ---------- LIST ----------
export async function listAdminAlerts(): Promise<AdminAlertDTO[]> {
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data, error } = await supabaseAdmin
  .from("alerts")
  .select("id,title,body,source_label,source_url,status,is_automated,created_at,updated_at,created_by")
  .order("created_at", { ascending: false })
  .limit(100)
  if (error) throw new Error(error.message)
  return (data?? []) as AdminAlertDTO[]
}

// ---------- CREATE ----------
export async function postEmergencyAlert(input: z.infer<typeof baseSchema>) {
  const data = baseSchema.parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const body = buildBody({
    source: data.source,
    title: data.title,
    details: data.details || undefined,
    source_url: data.source_url || undefined,
  })

  const { data: row, error } = await supabaseAdmin
  .from("alerts")
  .insert({
    title: data.title.slice(0, 200),
    body,
    severity: "warning",
    category: "public_safety",
    city: "San Jose",
    state_code: "CA",
    latitude: ZIP_LAT,
    longitude: ZIP_LNG,
    location_label: `San Jose, CA ${ZIP}`,
    is_automated: false,
    source_label: data.source,
    source_url: data.source_url || null,
    created_by: userId,
    status: data.status,
  } as any)
  .select("id")
  .single()
  if (error) throw new Error(error.message)

  if (data.status === "published") {
    await supabaseAdmin.from("posts").insert({
      user_id: BOT_USER_ID,
      body,
      tag: "Alert",
      zip_code: ZIP,
      latitude: ZIP_LAT,
      longitude: ZIP_LNG,
      state_code: "CA",
      country_code: "US",
    } as any)
  }

  await supabaseAdmin.from("alert_audit_log").insert({
    alert_id: row!.id,
    actor_id: userId,
    action: data.status === "draft"? "draft" : "create",
    snapshot: { ...data, body },
  } as any)

  return { ok: true, alert_id: row!.id as string }
}

// ---------- UPDATE ----------
const updateSchema = baseSchema.partial().extend({
  id: z.string().uuid(),
})

export async function updateEmergencyAlert(input: z.infer<typeof updateSchema>) {
  const data = updateSchema.parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: existing, error: exErr } = await supabaseAdmin
  .from("alerts")
  .select("id,title,body,source_label,source_url,status")
  .eq("id", data.id)
  .maybeSingle()
  if (exErr) throw new Error(exErr.message)
  if (!existing) throw new Error("Alert not found")

  const next = {
    source: data.source?? existing.source_label?? "Alert",
    title: data.title?? existing.title,
    details: data.details?? "",
    source_url: data.source_url?? existing.source_url?? "",
  }
  const body = buildBody(next)

  const patch: Record<string, any> = {
    title: next.title.slice(0, 200),
    body,
    source_label: next.source,
    source_url: next.source_url || null,
  }
  if (data.status) patch.status = data.status

  const { error } = await supabaseAdmin.from("alerts").update(patch as any).eq("id", data.id)
  if (error) throw new Error(error.message)

  await supabaseAdmin.from("alert_audit_log").insert({
    alert_id: data.id,
    actor_id: userId,
    action: "update",
    snapshot: { before: existing, after: patch },
  } as any)

  return { ok: true }
}

// ---------- DELETE ----------
export async function deleteEmergencyAlert(input: { id: string }) {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: existing } = await supabaseAdmin
  .from("alerts")
  .select("id,title,body,status,source_label")
  .eq("id", id)
  .maybeSingle()

  const { error } = await supabaseAdmin.from("alerts").delete().eq("id", id)
  if (error) throw new Error(error.message)

  await supabaseAdmin.from("alert_audit_log").insert({
    alert_id: id,
    actor_id: userId,
    action: "delete",
    snapshot: existing?? {},
  } as any)

  return { ok: true }
}

// ---------- SET STATUS (publish / unpublish / draft) ----------
export async function setAlertStatus(input: {
  id: string
  status: "draft" | "published" | "unpublished"
}) {
  const data = z.object({
    id: z.string().uuid(),
    status: z.enum(["draft", "published", "unpublished"]),
  }).parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: existing, error: exErr } = await supabaseAdmin
  .from("alerts")
  .select("id,title,body,status")
  .eq("id", data.id)
  .maybeSingle()
  if (exErr) throw new Error(exErr.message)
  if (!existing) throw new Error("Alert not found")

  const { error } = await supabaseAdmin
  .from("alerts")
  .update({ status: data.status })
  .eq("id", data.id)
  if (error) throw new Error(error.message)

  if (data.status === "published" && existing.status!== "published") {
    await supabaseAdmin.from("posts").insert({
      user_id: BOT_USER_ID,
      body: existing.body,
      tag: "Alert",
      zip_code: ZIP,
      latitude: ZIP_LAT,
      longitude: ZIP_LNG,
      state_code: "CA",
      country_code: "US",
    } as any)
  }

  const action =
    data.status === "published"? "publish" : data.status === "unpublished"? "unpublish" : "draft"

  await supabaseAdmin.from("alert_audit_log").insert({
    alert_id: data.id,
    actor_id: userId,
    action,
    snapshot: { from: existing.status, to: data.status },
  } as any)

  return { ok: true }
}

// ---------- AUDIT LOG ----------
export type AlertAuditEntry = {
  id: string
  alert_id: string | null
  actor_id: string | null
  actor_name: string | null
  action: string
  snapshot: any
  created_at: string
}

export async function listAlertAuditLog(): Promise<AlertAuditEntry[]> {
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data, error } = await supabaseAdmin
  .from("alert_audit_log")
  .select("id,alert_id,actor_id,action,snapshot,created_at")
  .order("created_at", { ascending: false })
  .limit(200)
  if (error) throw new Error(error.message)

  const ids = Array.from(new Set((data?? []).map((r: any) => r.actor_id).filter(Boolean)))
  let nameMap = new Map<string, string>()
  if (ids.length > 0) {
    const { data: profs } = await supabaseAdmin
    .from("profiles")
    .select("user_id,display_name")
    .in("user_id", ids)
    nameMap = new Map((profs?? []).map((p: any) => [p.user_id, p.display_name]))
  }

  return (data?? []).map((r: any) => ({
    ...r,
    actor_name: r.actor_id? nameMap.get(r.actor_id)?? null : null,
  }))
}
