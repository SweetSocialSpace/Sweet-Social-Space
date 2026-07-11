'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Universal CMS for posts (humans + bots). Admins only.
// Phase 1: Stubbed to return empty data. Will wire up in Phase 2.
// Visibility maps to existing `posts` columns:
//   published   -> hidden=false, moderation_status='visible'
//   unpublished -> hidden=true,  moderation_status='hidden'
//   draft       -> hidden=true,  moderation_status='under_review'

async function getAuth() {
  const supabase = createClient()
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
  // Phase 1 stub: return empty array
  return []
}

const updateSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
  tag: z.string().trim().max(40).optional().or(z.literal("")),
})

export async function updateAdminPost(input: z.infer<typeof updateSchema>) {
  // Phase 1 stub
  return { ok: false, error: "Admin CMS disabled in Phase 1" }
}

export async function deleteAdminPost(input: { id: string }) {
  // Phase 1 stub
  return { ok: false, error: "Admin CMS disabled in Phase 1" }
}

export async function setAdminPostVisibility(input: {
  id: string
  visibility: "published" | "draft" | "unpublished"
}) {
  // Phase 1 stub
  return { ok: false, error: "Admin CMS disabled in Phase 1" }
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
  // Phase 1 stub: return empty array
  return []
}
