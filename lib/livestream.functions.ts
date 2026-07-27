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

export async function createLivestream(input: {
  title: string
  description?: string | null
  scheduled_at?: string | null
}): Promise<{ id: string; stream_key: string } | { error: string }> {
  try {
    const supabase = await createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Please sign in to go live' }

    let userZip = ''
    let userCity = ''
    let userCountry = ''
    try {
      const { data: profile } = await supabase.from('profiles')
      .select('zip_code, zip, city, country')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .maybeSingle()
      userZip = profile?.zip_code || profile?.zip || ''
      userCity = profile?.city || ''
      userCountry = profile?.country || ''
    } catch {}

    const { data, error } = await supabase.from('posts').insert({
      body: input.title || '🔴 LIVE on the block - recording',
      content: input.description || 'Live recording from my block',
      tag: 'live',
      category: 'general',
      post_type: 'general',
      city: userCity || 'My Block',
      zip_code: userZip || '',
      country: userCountry || '',
      user_id: user.id
    }).select().single()

    if (error) return { error: error.message }
    if (!data) return { error: 'Could not start live' }
    return { id: data.id, stream_key: data.id }
  } catch {
    return { error: 'Safe mode - try again' }
  }
}

export async function getLivestream(input: { id: string }): Promise<LivestreamDTO | null> {
  try {
    const supabase = await createClient() as any
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
  } catch { return null }
}

export async function listLivestreams(input?: { limit?: number; status?: 'live' | 'scheduled' }): Promise<LivestreamDTO[]> {
  try {
    const supabase = await createClient() as any
    const { data } = await supabase.from('posts').select('*').eq('tag','live').order('created_at',{ascending:false}).limit(input?.limit || 10)
    return (data || []).map((d: any) => ({
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
  } catch { return [] }
}

export async function startLivestream(input: { id: string }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}

export async function endLivestream(input: { id: string }): Promise<{ ok: true }> {
  try { return { ok: true } } catch { return { ok: true } }
}

export async function deleteLivestream(input: { id: string }): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = await createClient() as any
    await supabase.from('posts').delete().eq('id', input.id)
    return { ok: true }
  } catch {
    return { error: 'Safe mode' }
  }
}

export async function getLivestreamToken(input: { stream_id: string }): Promise<{ token: string | null }> {
  try { return { token: 'local-recording' } } catch { return { token: null } }
}
