import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      console.warn('Supabase env missing in middleware - bypassing')
      return response
    }

    const supabase = createServerClient(url, anon, {
      cookies: {
        get(name: string) {
          try { return request.cookies.get(name)?.value } catch { return undefined }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value, ...options })
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value: '', ...options })
          } catch {}
        },
      },
    })

    await supabase.auth.getUser()
    return response
  } catch {
    // House never dies at gate - middleware never crashes site
    return response
  }
}
