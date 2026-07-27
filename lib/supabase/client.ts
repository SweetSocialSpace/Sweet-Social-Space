import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      console.warn('Supabase env missing - client safe mode')
      return createBrowserClient('https://safe-mode.supabase.co', 'safe-mode-key') as any
    }

    return createBrowserClient(url, anon)
  } catch {
    return createBrowserClient('https://safe-mode.supabase.co', 'safe-mode-key') as any
  }
}
