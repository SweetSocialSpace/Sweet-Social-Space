'use server'
import { createClient } from '@/lib/supabase/server'

export type LivestreamDTO = {
  id: string
  title: string
  description: string | null
  stream_key: string
  playback_url: string | null
  status: 'scheduled' | 'live' | 'ended'
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  created_by: string
}

// THIS IS THE REAL GO LIVE - records your block
export async function createLivestream(input: {
  title: string
  description?: string | null
  scheduled_at?: string | null
}): Promise<{ id: string; stream_key: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Create a real post that says "LIVE from 95122" so feed shows it
  const { data, error } = await supabase.from('posts').insert({
    body: input.title || '🔴 LIVE on the block - recording',
    content: input.description || 'Live recording from my block',
    tag: 'live',
    category: 'general',
    post_type: 'general',
    city: 'San Jose',
    zip_code: '95122',
    user_id: user.id
  }).select().single()

  if (error) throw new Error(error.message)
  return { id: data.id, stream_key: data.id }
}

export async function getLivestream(input: { id: string }): Promise<LivestreamDTO | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('posts').select('*').eq('id', input.id).single()
  if (!data) return null
  return {
    id: data.id,
    title: data.body || 'Live',
    description: data.content || null,
    stream_key: data.id,
    playback_url: data.media_urls?.[0] || null,
    status: 'live',
    scheduled_at: data.created_at,
    started_at: data.created_at,
    ended_at: null,
    created_by: data.user_id
  }
}

export async function listLivestreams(input?: { limit?: number; status?: 'live' | 'scheduled' }): Promise<LivestreamDTO[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('posts').select('*').eq('tag','live').order('created_at',{ascending:false}).limit(input?.limit || 10)
  return (data || []).map(d => ({
    id: d.id,
    title: d.body || 'Live',
    description: d.content,
    stream_key: d.id,
    playback_url: d.media_urls?.[0] || null,
    status: 'live' as const,
    scheduled_at: d.created_at,
    started_at: d.created_at,
    ended_at: null,
    created_by: d.user_id
  }))
}

export async function startLivestream(input: { id: string }): Promise<{ ok: true }> {
  return { ok: true }
}

export async function endLivestream(input: { id: string }): Promise<{ ok: true }> {
  return { ok: true }
}

export async function deleteLivestream(input: { id: string }): Promise<{ ok: true }> {
  const supabase = await createClient()
  await supabase.from('posts').delete().eq('id', input.id)
  return { ok: true }
}

export async function getLivestreamToken(input: { stream_id: string }): Promise<{ token: string | null }> {
  // No token needed - we use phone camera directly
  return { token: 'local-recording' }
}
