'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'

// Universal CMS for posts (humans + bots). Admins only.
// Visibility maps to existing `posts` columns:
//   published   -> hidden=false, moderation_status='visible'
//   unpublished -> hidden=true,  moderation_status='hidden'
//   draft       -> hidden=true,  moderation_status='under_review'

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  })
  if (error || data !== true) throw new Error("Admin only")
}

export type PostVisibility = "published" | "draft" | "unpublished"

export type AdminPostDTO = {
  id: string
  user_id: string
  author_name: string | null
  author_is_bot: boolean
  body: string
  tag: string | null
  media_url: string | null
  media_type: string | null
  hidden: boolean
  moderation_status: string | null
  visibility: PostVisibility
  zip_code: string | null
  created_at: string
  updated_at: string
}

function toVisibility(hidden: boolean, status: string | null): PostVisibility {
  if (!hidden && (status === "visible" || status === null)) return "published"
  if (status === "under_review") return "draft"
  return "unpublished"
}

const BOT_IDS = new Set([
  "b0700000-0000-0000-0000-000000095122",
  "b0700000-0000-0000-0000-000000911911",
  "b0700000-0000-0000-0000-000000555555",
  "b07b07b0-0000-4000-8000-000000071175",
  "b07b07b0-0000-4000-8000-000000071176",
])

const listSchema = z.object({
  user_id: z.string().uuid().optional(),
  user_ids: z.array(z.string().uuid()).optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.number().int().min(1).max(200).optional(),
})

export async function listAdminPosts(input?: z.infer<typeof listSchema>): Promise<AdminPostDTO[]> {
  const data = listSchema.parse(input?? {})
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  let q = supabaseAdmin
  .from("posts")
  .select(
    "id,user_id,body,tag,media_url,media_type,hidden,moderation_status,zip_code,created_at,updated_at",
  )
  .order("created_at", { ascending: false })
  .limit(data.limit?? 100)

  if (data.user_id) q = q.eq("user_id", data.user_id)
  if (data.user_ids?.length) q = q.in("user_id", data.user_ids)
  if (data.search) q = q.ilike("body", `%${data.search}%`)

  const { data: rows, error } = await q
  if (error) throw new Error(error.message)

  const ids = Array.from(new Set((rows?? []).map((r: any) => r.user_id)))
  let nameMap = new Map<string, string>()
  if (ids.length) {
    const { data: profs } = await supabaseAdmin
    .from("profiles")
    .select("user_id,display_name")
    .in("user_id", ids)
    nameMap = new Map(
      (profs?? []).map((p: any) => [p.user_id, p.display_name?? ""]),
    )
  }

  return (rows?? []).map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    author_name: nameMap.get(r.user_id)?? null,
    author_is_bot: BOT_IDS.has(r.user_id),
    body: r.body,
    tag: r.tag,
    media_url: r.media_url,
    media_type: r.media_type,
    hidden: !!r.hidden,
    moderation_status: r.moderation_status,
    visibility: toVisibility(!!r.hidden, r.moderation_status),
    zip_code: r.zip_code,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }))
}

const updateSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
  tag: z.string().trim().max(40).optional().or(z.literal("")),
})

export async function updateAdminPost(input: z.infer<typeof updateSchema>) {
  const data = updateSchema.parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: existing, error: exErr } = await supabaseAdmin
  .from("posts")
  .select("id,body,tag,user_id")
  .eq("id", data.id)
  .maybeSingle()
  if (exErr) throw new Error(exErr.message)
  if (!existing) throw new Error("Post not found")

  const patch: Record<string, any> = { body: data.body }
  if (data.tag!== undefined) patch.tag = data.tag || existing.tag

  const { error } = await supabaseAdmin.from("posts").update(patch as any).eq("id", data.id)
  if (error) throw new Error(error.message)

  await supabaseAdmin.from("post_audit_log").insert({
    post_id: data.id,
    actor_id: userId,
    action: "edit",
    snapshot: { before: existing, after: patch },
  } as any)

  return { ok: true }
}

export async function deleteAdminPost(input: { id: string }) {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: existing } = await supabaseAdmin
  .from("posts")
  .select("id,body,tag,user_id,hidden,moderation_status")
  .eq("id", id)
  .maybeSingle()

  const { error } = await supabaseAdmin.from("posts").delete().eq("id", id)
  if (error) throw new Error(error.message)

  await supabaseAdmin.from("post_audit_log").insert({
    post_id: id,
    actor_id: userId,
    action: "delete",
    snapshot: existing?? {},
  } as any)

  return { ok: true }
}

export async function setAdminPostVisibility(input: {
  id: string
  visibility: "published" | "draft" | "unpublished"
}) {
  const data = z.object({
    id: z.string().uuid(),
    visibility: z.enum(["published", "draft", "unpublished"]),
  }).parse(input)
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: existing, error: exErr } = await supabaseAdmin
  .from("posts")
  .select("id,hidden,moderation_status")
  .eq("id", data.id)
  .maybeSingle()
  if (exErr) throw new Error(exErr.message)
  if (!existing) throw new Error("Post not found")

  const map: Record<PostVisibility, { hidden: boolean; moderation_status: string }> = {
    published: { hidden: false, moderation_status: "visible" },
    draft: { hidden: true, moderation_status: "under_review" },
    unpublished: { hidden: true, moderation_status: "hidden" },
  }
  const patch = map[data.visibility]

  const { error } = await supabaseAdmin.from("posts").update(patch as any).eq("id", data.id)
  if (error) throw new Error(error.message)

  await supabaseAdmin.from("post_audit_log").insert({
    post_id: data.id,
    actor_id: userId,
    action: data.visibility,
    snapshot: {
      from: toVisibility(!!existing.hidden, existing.moderation_status),
      to: data.visibility,
    },
  } as any)

  return { ok: true }
}

export type PostAuditEntry = {
  id: string
  post_id: string | null
  actor_id: string | null
  actor_name: string | null
  actor_is_bot: boolean
  action: string
  snapshot: any
  created_at: string
}

const auditSchema = z.object({
  post_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  user_ids: z.array(z.string().uuid()).optional(),
  limit: z.number().int().min(1).max(500).optional(),
})

export async function listPostAuditLog(input?: z.infer<typeof auditSchema>): Promise<PostAuditEntry[]> {
  const data = auditSchema.parse(input?? {})
  const { supabase, userId } = await getAuth()
  await assertAdmin(supabase, userId)
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  let postIds: string[] | null = null
  if (data.user_id || data.user_ids?.length) {
    const ids = data.user_ids?.length? data.user_ids : [data.user_id!]
    const { data: prows } = await supabaseAdmin
    .from("posts")
    .select("id")
    .in("user_id", ids)
    .limit(500)
    postIds = (prows?? []).map((r: any) => r.id)
  }

  let q = supabaseAdmin
  .from("post_audit_log")
  .select("id,post_id,actor_id,action,snapshot,created_at")
  .order("created_at", { ascending: false })
  .limit(data.limit?? 200)

  if (data.post_id) q = q.eq("post_id", data.post_id)
  else if (postIds && postIds.length) q = q.in("post_id", postIds)
  else if (postIds &&!postIds.length) return []

  const { data: rows, error } = await q
  if (error) throw new Error(error.message)

  const actorIds = Array.from(
    new Set((rows?? []).map((r: any) => r.actor_id).filter(Boolean)),
  )
  let nameMap = new Map<string, string>()
  if (actorIds.length) {
    const { data: profs } = await supabaseAdmin
    .from("profiles")
    .select("user_id,display_name")
    .in("user_id", actorIds)
    nameMap = new Map(
      (profs?? []).map((p: any) => [p.user_id, p.display_name?? ""]),
    )
  }

  return (rows?? []).map((r: any) => ({
    id: r.id,
    post_id: r.post_id,
    actor_id: r.actor_id,
    actor_name: r.actor_id? nameMap.get(r.actor_id)?? null : null,
    actor_is_bot: r.actor_id? BOT_IDS.has(r.actor_id) : false,
    action: r.action,
    snapshot: r.snapshot,
    created_at: r.created_at,
  }))
}
