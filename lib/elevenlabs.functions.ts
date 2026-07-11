'use server'

import { createServerClient } from '@/integrations/supabase/client.server'

export async function getScribeToken() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error ||!user) throw new Error('Unauthorized')

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return { token: null as string | null, error: "ElevenLabs is not connected" }
  }
  const res = await fetch(
    "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
    { method: "POST", headers: { "xi-api-key": apiKey } }
  )
  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    console.error("[elevenlabs] token request failed", res.status, txt)
    return { token: null as string | null, error: "Voice token unavailable." }
  }
  const data = (await res.json()) as { token: string }
  return { token: data.token, error: null as string | null }
}
