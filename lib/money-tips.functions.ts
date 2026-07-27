'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Money tips stubbed - house-safe, global, never dies

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

async function getAuthSafe() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return { supabase, user }
  } catch {
    return null // House never dies - auth fails -> safe null, not throw
  }
}

export async function listMoneyTips(input?: { 
  limit?: number;
  category?: string | null;
  featured?: boolean;
}): Promise<MoneyTipDTO[]> {
  try { return [] } catch { return [] }
}

export async function getMoneyTip(input: { id: string }): Promise<MoneyTipDTO | null> {
  try { return null } catch { return null }
}

export async function createMoneyTip(input: {
  title: string
  content: string
  category?: string | null
}): Promise<{ id: string } | { error: string }> {
  try {
    const auth = await getAuthSafe()
    if (!auth) return { error: 'Please sign in' } // Global message, no throw
    return { id: "stubbed-for-phase-1" }
  } catch {
    return { error: 'Safe mode - try again' }
  }
}

export async function updateMoneyTip(input: {
  id: string
  title?: string
  content?: string
  category?: string | null
  is_featured?: boolean
}): Promise<{ ok: true } | { error: string }> {
  try {
    const auth = await getAuthSafe()
    if (!auth) return { error: 'Please sign in' }
    return { ok: true }
  } catch {
    return { error: 'Safe mode' }
  }
}

export async function deleteMoneyTip(input: { id: string }): Promise<{ ok: true } | { error: string }> {
  try {
    const auth = await getAuthSafe()
    if (!auth) return { error: 'Please sign in' }
    return { ok: true }
  } catch {
    return { error: 'Safe mode' }
  }
}

export async function voteMoneyTip(input: {
  id: string
  vote_type: 'up' | 'down'
}): Promise<{ ok: true } | { error: string }> {
  try {
    const auth = await getAuthSafe()
    if (!auth) return { error: 'Please sign in' }
    return { ok: true }
  } catch {
    return { error: 'Safe mode' }
  }
}
