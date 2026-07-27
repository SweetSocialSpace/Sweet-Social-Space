'use server'

import { createClient } from '@/lib/supabase/server'

// Phase 1: Scribe token stubbed - global, house-safe, never dies

export async function getScribeToken(): Promise<{ token: string | null; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { token: null, error: "Please sign in for voice" }

    // Phase 1 stub - voice disabled, but house alive
    return { token: null as string | null, error: "Voice features coming in Phase 2" }
  } catch {
    // House never dies - Supabase down = no token, not crash
    return { token: null, error: "Safe mode - voice offline" }
  }
}
