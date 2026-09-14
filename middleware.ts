// middleware.ts - AUTH + GLOBAL LANGUAGE (combined)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

// 1. Language config - any zip on earth, any language
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'es', 'fr', 'de', 'pt', 'hi', 'ar', 'zh', 'ja', 'sw'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // /feed works, /es/feed also works
  localeDetection: true // reads Accept-Language automatically
})

export async function middleware(request: NextRequest) {
  // Skip API routes, static files, and Next.js internals (your existing rule)
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // --- STEP 1: LANGUAGE DETECTION ---
  // Let next-intl detect language from browser
  const intlResponse = intlMiddleware(request)
  // If intl wants to redirect (e.g., / to /es), respect it but keep cookies
  let response = intlResponse || NextResponse.next({
    request: { headers: request.headers },
  })

  // --- STEP 2: YOUR EXISTING AUTH LOGIC ---
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl ||!supabaseKey) {
      return response
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value,...options })
          // Important: update the intl response with auth cookies
          response.cookies.set({ name, value,...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '',...options })
          response.cookies.set({ name, value: '',...options })
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthPage =
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup') ||
      request.nextUrl.pathname.startsWith('/auth')

    const isProtectedPage =
      request.nextUrl.pathname.startsWith('/feed') ||
      request.nextUrl.pathname.startsWith('/onboarding')

    if (!user && isProtectedPage && request.nextUrl.pathname!== '/login') {
      // Preserve detected locale when redirecting to login
      const locale = request.cookies.get('NEXT_LOCALE')?.value ||
                     request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en'
      return NextResponse.redirect(new URL(`/${locale}/login`.replace('/en/', '/'), request.url))
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/feed', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/).*)'],
}
