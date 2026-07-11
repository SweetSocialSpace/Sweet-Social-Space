import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['NEXT_PUBLIC_SUPABASE_URL'] : []),
      ...(!SUPABASE_SERVICE_ROLE_KEY ? ['SUPABASE_SERVICE_ROLE_KEY'] : []),
    ]
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}`
    console.error(`[Supabase] ${message}`)
    throw new Error(message)
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}

// Server-side Supabase client with service role - bypasses RLS
// SECURITY: Only import this in Server Actions, Route Handlers, or server-only files
// Never import in Client Components - it will expose your service role key
export const supabaseAdmin = createSupabaseAdminClient()
