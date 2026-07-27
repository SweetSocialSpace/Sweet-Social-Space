import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // House-safe - if env missing, return a client that won't crash, just no-ops
    if (!url || !key) {
      console.warn('Supabase env missing - house in safe mode')
      // Return a minimal mock that won't kill house, but logs
      // This keeps feed alive even if Supabase down
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
    }

    return createBrowserClient(url, key)
  } catch (e) {
    console.error('Supabase client create failed, house safe mode:', e)
    // Last resort - never throw to feed
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
}
