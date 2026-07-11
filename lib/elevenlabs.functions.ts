'use server'

import { createClient } from '@/lib/supabase/server'

// Phase 1: ElevenLabs Scribe token stubbed. Will wire up in Phase 2.

export async function getScribeToken() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')

  // Phase 1 stub: Voice transcription disabled
  return { token: null as string | null, error: "Voice features coming in Phase 2" }
}
