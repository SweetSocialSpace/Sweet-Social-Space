import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    console.warn('Supabase env missing - using safe mode for development')
    return createBrowserClient('https://safe-mode.supabase.co', 'safe-mode-key') as any
  }

  return createBrowserClient(url, anon)
}
