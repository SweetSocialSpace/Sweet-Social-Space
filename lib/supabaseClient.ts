import { createClient } from '@supabase/supabase-js'

export const supabaseBrowser = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// keep the other name working too
export const supabaseClient = supabaseBrowser
