import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  try {
    const cookieStore = cookies()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // House never dies - silent safe mode, no 404 spam in logs
    if (!url || !anon) {
      console.warn('Supabase env missing - safe mode - returning empty')
      const emptyResult = { data: [], count: 0, error: null }
      
      const createChain = (): any => {
        const chain: any = {
          eq: () => chain,
          neq: () => chain,
          gt: () => chain,
          gte: () => chain,
          lt: () => chain,
          lte: () => chain,
          or: () => chain,
          order: () => chain,
          limit: () => chain,
          range: () => chain,
          single: () => Promise.resolve({ data: null, error: null, count: 0 }),
          then: (resolve: any) => resolve(emptyResult),
        }
        return chain
      }

      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
        },
        from: () => ({
          select: () => createChain(),
          insert: () => Promise.resolve({ data: null, error: null }),
          delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
          update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        }),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        },
      } as any
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
    const emptyResult = { data: [], count: 0, error: null }
    const createChain = (): any => {
      const chain: any = {
        eq: () => chain,
        gte: () => chain,
        or: () => chain,
        order: () => chain,
        limit: () => chain,
        single: () => Promise.resolve({ data: null, error: null, count: 0 }),
        then: (resolve: any) => resolve(emptyResult),
      }
      return chain
    }
    return {
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      from: () => ({
        select: () => createChain(),
        insert: () => Promise.resolve({ data: null, error: null }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      }),
    } as any
  }
}
