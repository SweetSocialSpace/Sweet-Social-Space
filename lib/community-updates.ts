'use server'

import { z } from 'zod'
import { applyScope, bboxForRadius, normalizeScopeInput, SCOPE_RADIUS_MILES, type LocationFilter } from '@/lib/location-scope'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export type CommunityUpdateDTO = {
  id: string
  title: string
  category: string
  description: string
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  is_automated?: boolean
  source_label?: string | null
}

export type UpdateCommentDTO = {
  id: string
  update_id: string
  body: string
  created_at: string
  display_name: string | null
}

const SELECT_COLS = "id,title,category,description,city,state,latitude,longitude,created_at,is_automated,source_label"

const scopeInput = z.object({
  scope: z.enum(["5mi", "20mi", "50mi", "state", "nationwide"]).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  state_code: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
}).partial()

export async function listCommunityUpdates(input?: { limit?: number; scope?: Partial<LocationFilter> }): Promise<CommunityUpdateDTO[]> {
  const limit = Math.min(Math.max(input?.limit?? 6, 1), 50)
  const scope = normalizeScopeInput(scopeInput.parse(input?.scope?? {}))

  let q = supabaseAdmin.from("community_updates").select(SELECT_COLS).order("created_at", { ascending: false })

  const radius = SCOPE_RADIUS_MILES[scope.scope]
  if (radius!= null && scope.lat!= null && scope.lng!= null) {
    const b = bboxForRadius(scope.lat, scope.lng, radius)
    q = q.gte("latitude", b.minLat).lte("latitude", b.maxLat).gte("longitude", b.minLng).lte("longitude", b.maxLng)
  } else if (scope.scope === "state" && scope.state_code) {
    q = q.eq("state", scope.state_code.toUpperCase())
  }

  const { data: rows, error } = await q.limit(Math.max(limit * 3, 20))
  if (error) throw new Error(error.message)
  const filtered = applyScope((rows?? []) as CommunityUpdateDTO[], scope)
  return filtered.slice(0, limit)
}

export async function getCommunityUpdate(input: { id: string }): Promise<{
  update: CommunityUpdateDTO
  comments: UpdateCommentDTO[]
  related: CommunityUpdateDTO[]
} | null> {
  const { id } = z.object({ id: z.string().uuid() }).parse(input)

  const { data: update, error } = await supabaseAdmin
  .from("community_updates")
  .select(SELECT_COLS)
  .eq("id", id)
  .maybeSingle()
  if (error) throw new Error(error.message)
  if (!update) return null

  const [commentsRes, relatedRes] = await Promise.all([
    supabaseAdmin
    .from("community_update_comments")
    .select("id,update_id,user_id,body,created_at")
    .eq("update_id", id)
    .order("created_at", { ascending: false })
    .limit(100),
    supabaseAdmin
    .from("community_updates")
    .select(SELECT_COLS)
    .eq("category", (update as CommunityUpdateDTO).category)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(4),
  ])
  if (commentsRes.error) throw new Error(commentsRes.error.message)
  if (relatedRes.error) throw new Error(relatedRes.error.message)

  const rawComments = (commentsRes.data?? []) as Array<{ id: string; update_id: string; user_id: string; body: string; created_at: string }>
  const userIds = Array.from(new Set(rawComments.map((c) => c.user_id)))
  let nameMap: Record<string, string | null> = {}
  if (userIds.length > 0) {
    const { data: profs } = await supabaseAdmin
    .from("profiles")
    .select("user_id,display_name")
    .in("user_id", userIds)
    nameMap = Object.fromEntries(
      (profs?? []).map((p: { user_id: string; display_name: string | null }) => [
        p.user_id,
        p.display_name,
      ]),
    )
  }

  return {
    update: update as CommunityUpdateDTO,
    comments: rawComments.map(({ user_id, ...c }) => ({ ...c, display_name: nameMap[user_id]?? null })),
    related: (relatedRes.data?? []) as CommunityUpdateDTO[],
  }
}
