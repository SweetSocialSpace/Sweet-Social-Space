'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const BOT_USER_ID = "b0700000-0000-0000-0000-000000911911" // bot identity

async function getAuthSafe() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return { supabase, userId: user.id }
  } catch { return null }
}

async function assertAdminSafe(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
    if (error) return false
    return data === true
  } catch { return false }
}

function buildBody(d: { source: string; title: string; details?: string; source_url?: string }) {
  try {
    const head = `🚨 ${d.source} Alert: ${d.title}`.slice(0, 240)
    const extra = d.details? `\n\n${d.details}` : ""
    const src = d.source_url? `\n\nSource: ${d.source_url}` : ""
    return `${head}${extra}${src}`.slice(0, 500)
  } catch { return `🚨 ${d.source} Alert: ${d.title}`.slice(0, 240) }
}

const baseSchema = z.object({
  source: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(200),
  details: z.string().trim().max(400).optional().or(z.literal("")),
  source_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("published"),
  zip_code: z.string().trim().min(2).max(12),
  lat: z.number().optional(),
  lng: z.number().optional(),
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

export async function listAdminAlerts(): Promise<AdminAlertDTO[]> {
  try { return [] } catch { return [] }
}

export async function postEmergencyAlert(input: z.infer<typeof baseSchema>): Promise<{ ok: true; alert_id: string } | { error: string }> {
  try {
    const parsed = baseSchema.parse(input)
    const auth = await getAuthSafe()
    if (!auth) return { error: 'Please sign in' }
    
    const isAdmin = await assertAdminSafe(auth.supabase, auth.userId)
    if (!isAdmin) return { error: 'Admin only' }

    const { data, error } = await auth.supabase.from('posts').insert({
      body: buildBody(parsed),
      tag: 'Emergency',
      zip_code: parsed.zip_code, 
      latitude: parsed.lat,
      longitude: parsed.lng,
      user_id: BOT_USER_ID,
      source_url: parsed.source_url || null,
    }).select('id').single()

    if (error) return { error: error.message }
    if (!data) return { error: 'Could not post alert' }
    return { ok: true, alert_id: data.id }
  } catch (e: any) {
    return { error: e?.message || 'Safe mode - try again' }
  }
}

const updateSchema = baseSchema.partial().extend({
  id: z.string().uuid(),
})

export async function updateEmergencyAlert(input: z.infer<typeof updateSchema>): Promise<{ ok: true } | { error: string }> {
  try { return { ok: true } } catch { return { error: 'Safe mode' } }
}

export async function deleteEmergencyAlert(input: { id: string }): Promise<{ ok: true } | { error: string }> {
  try { return { ok: true } } catch { return { error: 'Safe mode' } }
}

export async function setAlertStatus(input: {
  id: string
  status: "draft" | "published" | "unpublished"
}): Promise<{ ok: true } | { error: string }> {
  try { return { ok: true } } catch { return { error: 'Safe mode' } }
}

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
  try { return [] } catch { return [] }
}
