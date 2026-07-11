'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Money tips system stubbed. Will wire up in Phase 2.

export type MoneyTipDTO = {
  id: string
  title: string
  content: string
  category: string | null
  author_id: string
  created_at: string
  upvotes: number
  downvotes: number
  is_featured: boolean
}

async function getAuth() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function listMoneyTips(input?: { 
  limit?: number;
  category?: string | null;
  featured?: boolean;
}): Promise<MoneyTipDTO[]> {
  // Phase 1 stub: return empty array
  return []
}

export async function getMoneyTip(input: { id: string }): Promise<MoneyTipDTO | null> {
  // Phase 1 stub
  return null
}

export async function createMoneyTip(input: {
  title: string
  content: string
  category?: string | null
}): Promise<{ id: string }> {
  await getAuth()
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function updateMoneyTip(input: {
  id: string
  title?: string
  content?: string
  category?: string | null
  is_featured?: boolean
}): Promise<{ ok: true }> {
  await getAuth()
  // Phase 1 stub
  return { ok: true }
}

export async function deleteMoneyTip(input: { id: string }): Promise<{ ok: true }> {
  await getAuth()
  // Phase 1 stub
  return { ok: true }
}

export async function voteMoneyTip(input: {
  id: string
  vote_type: 'up' | 'down'
}): Promise<{ ok: true }> {
  await getAuth()
  // Phase 1 stub
  return { ok: true }
}
