'use server'

import { z } from 'zod'
import { createClient, requireAuth } from '@/integrations/supabase/client.server'
import { supabaseAdmin } from '@/integrations/supabase/client.server' // if you need admin
import crypto from 'crypto'

type StripeEnv = 'sandbox' | 'live'

const ALLOWED_RETURN_HOSTS = new Set<string>([
  'sweetsocialspace.com',
  'www.sweetsocialspace.com',
  'sweetsocialspace.lovable.app',
  'id-preview--b94e3455-6a16-40de-8102-13b4b19ca474.lovable.app',
  'project--b94e3455-6a16-40de-8102-13b4b19ca474.lovable.app',
  'project--b94e3455-6a16-40de-8102-13b4b19ca474-dev.lovable.app',
])

function assertSafeReturnUrl(rawUrl: string): string {
  let parsed: URL
  try { parsed = new URL(rawUrl) } catch { throw new Error('Invalid return URL') }
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (parsed.protocol!== 'https:' &&!(parsed.protocol === 'http:' && isLocal)) throw new Error('Invalid return URL')
  if (!ALLOWED_RETURN_HOSTS.has(parsed.hostname) &&!isLocal) throw new Error('Invalid return URL')
  return parsed.toString()
}

// Server-side check: does this user have an active Creator subscription?
async function userIsCreator(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  env: StripeEnv,
): Promise<boolean> {
  const { data } = await supabase
   .from('subscriptions')
   .select('status, current_period_end, price_id')
   .eq('user_id', userId)
   .eq('environment', env)
   .eq('price_id', 'creator_monthly')
   .order('created_at', { ascending: false })
   .limit(1)
   .maybeSingle()
  if (!data) return false
  if (['active', 'trialing', 'past_due'].includes(data.status)) return true
  if (data.status === 'canceled' && data.current_period_end && new Date(data.current_period_end).getTime() > Date.now()) return true
  return false
}

// ----- Creator checkout -----
const checkoutSchema = z.object({
  returnUrl: z.string().url(),
  environment: z.enum(['sandbox', 'live']),
})

export async function createCreatorCheckout(input: z.infer<typeof checkoutSchema>): Promise<{ url: string } | { error: string }> {
  const { userId, supabase } = await requireAuth()
  const { returnUrl, environment } = checkoutSchema.parse(input)
  const env = environment as StripeEnv
  const safeReturnUrl = assertSafeReturnUrl(returnUrl)

  if (await userIsCreator(supabase, userId, env)) {
    return { error: "You're already a Creator." }
  }

  try {
    const { createStripeClient } = await import('@/lib/stripe.server')
    const stripe = createStripeClient(env)
    const prices = await stripe.prices.list({ lookup_keys: ['creator_monthly'], limit: 1 })
    const price = prices.data[0]
    if (!price) return { error: 'Creator plan not configured' }

    const { data: { user } } = await supabase.auth.getUser()
    // Resolve a customer with userId metadata
    let customerId: string | undefined
    const found = await stripe.customers.search({ query: `metadata['userId']:'${userId}'`, limit: 1 })
    if (found.data.length) customerId = found.data[0].id
    else {
      const created = await stripe.customers.create({
       ...(user?.email && { email: user.email }),
        metadata: { userId },
      })
      customerId = created.id
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: price.id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${safeReturnUrl}?creator=success`,
      cancel_url: `${safeReturnUrl}?creator=cancel`,
      customer: customerId,
      client_reference_id: userId,
      subscription_data: { metadata: { userId } },
      metadata: { userId, kind: 'creator_subscription' },
      managed_payments: { enabled: true },
    } as Parameters<typeof stripe.checkout.sessions.create>[0])
    if (!session.url) return { error: 'Stripe did not return a checkout URL' }
    return { url: session.url }
  } catch (e) {
    const { getStripeErrorMessage } = await import('@/lib/stripe.server')
    return { error: getStripeErrorMessage(e) }
  }
}

// ----- Creator status (read for client) -----
export async function getCreatorStatus(input: { environment: StripeEnv }): Promise<{ isCreator: boolean }> {
  const { supabase, userId } = await requireAuth()
  if (input.environment!== 'sandbox' && input.environment!== 'live') throw new Error('Invalid environment')
  return { isCreator: await userIsCreator(supabase, userId, input.environment) }
}

// ----- Start broadcast -----
const startSchema = z.object({
  title: z.string().trim().min(1).max(140),
})

type LiveTokenResponse = { streamId: string; roomName: string; wsUrl: string; token: string } | { error: string }
const LIVE_HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000

async function mintLiveKitToken(opts: {
  identity: string
  name?: string
  roomName: string
  canPublish: boolean
  ttlSeconds: number
}): Promise<{ token: string; wsUrl: string }> {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.LIVEKIT_WS_URL
  if (!apiKey ||!apiSecret ||!wsUrl) throw new Error('LiveKit is not configured')
  const { AccessToken } = await import('livekit-server-sdk')
  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
    ttl: opts.ttlSeconds,
  })
  at.addGrant({
    room: opts.roomName,
    roomJoin: true,
    canPublish: opts.canPublish,
    canSubscribe:!opts.canPublish? true : false,
    canPublishData: opts.canPublish,
  })
  const token = await at.toJwt()
  return { token, wsUrl }
}

export async function startLiveStream(input: z.infer<typeof startSchema>): Promise<LiveTokenResponse> {
  const { userId, supabase } = await requireAuth()
  const { title } = startSchema.parse(input)

  // End any prior live stream by this user (only one at a time)
  await supabase
   .from('live_streams')
   .update({ status: 'ended', ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
   .eq('user_id', userId)
   .eq('status', 'live')

  const roomName = `ls-${crypto.randomUUID()}`
  const { data: row, error } = await supabase
   .from('live_streams')
   .insert({ user_id: userId, title, room_name: roomName, status: 'live' })
   .select('id, room_name')
   .single()
  if (error ||!row) return { error: error?.message?? 'Could not start stream' }

  try {
    const { token, wsUrl } = await mintLiveKitToken({
      identity: `pub-${userId}`,
      roomName: row.room_name,
      canPublish: true,
      ttlSeconds: 60 * 60 * 8, // 8h so long broadcasts do not drop from token expiry.
    })
    return { streamId: row.id, roomName: row.room_name, wsUrl, token }
  } catch (e) {
    // Cleanup row if token mint failed
    await supabase.from('live_streams').update({ status: 'ended', ended_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', row.id)
    return { error: e instanceof Error? e.message : 'Could not mint LiveKit token' }
  }
}

// ----- End broadcast -----
export async function endLiveStream(input: { streamId: string }): Promise<{ ok: true }> {
  const { userId, supabase } = await requireAuth()
  const { streamId } = z.object({ streamId: z.string().uuid() }).parse(input)
  const { error } = await supabase
   .from('live_streams')
   .update({ status: 'ended', ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
   .eq('id', streamId)
   .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function heartbeatLiveStream(input: { streamId: string }): Promise<{ ok: true }> {
  const { userId, supabase } = await requireAuth()
  const { streamId } = z.object({ streamId: z.string().uuid() }).parse(input)
  const { error } = await supabase
   .from('live_streams')
   .update({ updated_at: new Date().toISOString() })
   .eq('id', streamId)
   .eq('user_id', userId)
   .eq('status', 'live')
  if (error) throw new Error(error.message)
  return { ok: true }
}

// ----- Viewer token -----
export async function getViewerToken(input: { streamId: string }): Promise<LiveTokenResponse> {
  const { userId, supabase } = await requireAuth()
  const { streamId } = z.object({ streamId: z.string().uuid() }).parse(input)
  const { data: stream } = await supabase
   .from('live_streams')
   .select('id, room_name, status, updated_at')
   .eq('id', streamId)
   .maybeSingle()
  if (!stream) return { error: 'Stream not found' }
  if (stream.status!== 'live') return { error: 'This stream has ended.' }
  if (new Date(stream.updated_at).getTime() < Date.now() - LIVE_HEARTBEAT_TIMEOUT_MS) {
    return { error: 'This stream is no longer active.' }
  }
  try {
    const { token, wsUrl } = await mintLiveKitToken({
      identity: `view-${userId}-${Math.random().toString(36).slice(2, 8)}`,
      roomName: stream.room_name,
      canPublish: false,
      ttlSeconds: 60 * 60 * 8, // 8h
    })
    return { streamId: stream.id, roomName: stream.room_name, wsUrl, token }
  } catch (e) {
    return { error: e instanceof Error? e.message : 'Could not mint viewer token' }
  }
}

// ----- Public list of live streams (for feed strip / profile pill) -----
export type LiveStreamCard = {
  id: string
  user_id: string
  title: string
  started_at: string
  display_name: string
  avatar_url: string | null
}

export async function listLiveStreams(input?: { followingOnly?: boolean; limit?: number }): Promise<LiveStreamCard[]> {
  const { supabase, userId } = await requireAuth()
  const followingOnly = input?.followingOnly?? false
  const limit = Math.min(Math.max(input?.limit?? 10, 1), 30)

  let userIds: string[] | null = null
  if (followingOnly) {
    const { data: f } = await supabase.from('follows').select('followee_id').eq('follower_id', userId)
    userIds = (f?? []).map((r: { followee_id: string }) => r.followee_id)
    if (!userIds.length) return []
  }
  let q = supabase
   .from('live_streams')
   .select('id, user_id, title, started_at')
   .eq('status', 'live')
   .gt('updated_at', new Date(Date.now() - LIVE_HEARTBEAT_TIMEOUT_MS).toISOString())
   .order('started_at', { ascending: false })
   .limit(limit)
  if (userIds) q = q.in('user_id', userIds)
  const { data: rows, error } = await q
  if (error) throw new Error(error.message)
  const ids = (rows?? []).map((r: { user_id: string }) => r.user_id)
  if (!ids.length) return []
  const { data: profs } = await supabase
   .from('profiles')
   .select('user_id, display_name, avatar_url')
   .in('user_id', ids)
  const byId = new Map<string, { display_name: string | null; avatar_url: string | null }>(
    (profs?? []).map((p: { user_id: string; display_name: string | null; avatar_url: string | null }) => [p.user_id, p]),
  )
  return (rows?? []).map((r: { id: string; user_id: string; title: string; started_at: string }) => ({
    id: r.id,
    user_id: r.user_id,
    title: r.title,
    started_at: r.started_at,
    display_name: byId.get(r.user_id)?.display_name || 'Creator',
    avatar_url: byId.get(r.user_id)?.avatar_url || null,
  }))
}
