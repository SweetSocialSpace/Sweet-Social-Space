import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  try {
    const cookieStore = cookies()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // House never dies - if env missing, return mock that returns empty not throw
    if (!url || !anon) {
      console.warn('Supabase env missing - safe mode')
      // Return a safe dummy that won't throw on .from().select()
      return createServerClient('https://safe-mode.supabase.co', 'safe-mode-key', {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }) as any
    }

    return createServerClient(url, anon, {
      cookies: {
        get(name: string) {
          try { return cookieStore.get(name)?.value } catch { return undefined }
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    })
  } catch {
    // House never dies - even if cookies() throws outside request context
    return createServerClient('https://safe-mode.supabase.co', 'safe-mode-key', {
      cookies: { get() { return undefined }, set() {}, remove() {} },
    }) as any
  }
}
