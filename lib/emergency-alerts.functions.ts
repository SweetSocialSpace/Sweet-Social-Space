'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Emergency alerts CMS stubbed. Will wire up in Phase 2.
// Admin CMS for emergency alerts. Posts to the 95122 feed as Emergency Bot
// when published. Drafts/unpublished entries stay in DB but hidden from public.

const BOT_USER_ID = "b0700000-0000-0000-0000-000000911911"
const ZIP = "95122"
const ZIP_LAT = 37.3382
const ZIP_LNG = -121.8413

async function getAuth() {
  const supabase = createClient()
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
  // Phase 1 stub: return empty array
  return []
}

// ---------- CREATE ----------
export async function postEmergencyAlert(input: z.infer<typeof baseSchema>) {
  // Phase 1 stub
  return { ok: true, alert_id: "stubbed-for-phase-1" }
}

// ---------- UPDATE ----------
const updateSchema = baseSchema.partial().extend({
  id: z.string().uuid(),
})

export async function updateEmergencyAlert(input: z.infer<typeof updateSchema>) {
  // Phase 1 stub
  return { ok: true }
}

// ---------- DELETE ----------
export async function deleteEmergencyAlert(input: { id: string }) {
  // Phase 1 stub
  return { ok: true }
}

// ---------- SET STATUS (publish / unpublish / draft) ----------
export async function setAlertStatus(input: {
  id: string
  status: "draft" | "published" | "unpublished"
}) {
  // Phase 1 stub
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
  // Phase 1 stub: return empty array
  return []
}
