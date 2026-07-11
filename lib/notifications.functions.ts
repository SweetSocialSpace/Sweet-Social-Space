'use server'

import { z } from 'zod'
import { createServerClient } from '@/integrations/supabase/client.server'

export type NotificationDTO = {
  id: string
  type: string
  source_id: string | null
  update_id: string | null
  event_id: string | null
  conversation_id: string | null
  live_stream_id: string | null
  post_id: string | null
  actor_id: string | null
  title: string
  body: string | null
  read: boolean
  created_at: string
  source_slug: string | null
}

async function getAuth() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

export async function listMyNotifications(input?: { limit?: number }): Promise<NotificationDTO[]> {
  const { supabase } = await getAuth()
  const limit = Math.min(Math.max(input?.limit?? 30, 1), 100)

  const { data: rows, error } = await supabase
  .from("notifications")
  .select("id,type,source_id,update_id,event_id,conversation_id,live_stream_id,post_id,actor_id,title,body,read,created_at, source:verified_sources(slug)")
  .order("created_at", { ascending: false })
  .limit(limit)
  if (error) throw new Error(error.message)
  return (rows?? []).map((r: { id: string; type: string; source_id: string | null; update_id: string | null; event_id: string | null; conversation_id: string | null; live_stream_id: string | null; post_id: string | null; actor_id: string | null; title: string; body: string | null; read: boolean; created_at: string; source?: { slug: string | null } | null }) => ({
    id: r.id,
    type: r.type,
    source_id: r.source_id,
    update_id: r.update_id,
    event_id: r.event_id,
    conversation_id: r.conversation_id,
    live_stream_id: r.live_stream_id,
    post_id: r.post_id,
    actor_id: r.actor_id,
    title: r.title,
    body: r.body,
    read: r.read,
    created_at: r.created_at,
    source_slug: r.source?.slug?? null,
  }))
}

export async function countMyUnreadNotifications(): Promise<{ count: number }> {
  const { supabase } = await getAuth()
  const { count, error } = await supabase
  .from("notifications")
  .select("id", { count: "exact", head: true })
  .eq("read", false)
  if (error) throw new Error(error.message)
  return { count: count?? 0 }
}

export async function markNotificationsRead(input: { ids?: string[]; all?: boolean }): Promise<{ ok: true }> {
  const { ids, all } = z.object({ ids: z.array(z.string().uuid()).optional(), all: z.boolean().optional() }).parse(input)
  const { supabase, userId } = await getAuth()
  
  let q = supabase.from("notifications").update({ read: true }).eq("user_id", userId)
  if (ids?.length) q = q.in("id", ids)
  else if (!all) return { ok: true }
  const { error } = await q
  if (error) throw new Error(error.message)
  return { ok: true }
}
