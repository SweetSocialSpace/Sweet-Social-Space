import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip API, Next internals, static files - CRITICAL for your marketing agent
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // --- LANGUAGE: just set cookie, don't redirect feed ---
  const acceptLang = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en'
  if (!request.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', acceptLang, { path: '/', maxAge: 60*60*24*365 })
  }

  // --- AUTH: your original working logic ---
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl ||!supabaseKey) return response

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value,...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value,...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '',...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '',...options })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup') || request.nextUrl.pathname.startsWith('/auth')
    const isProtectedPage = request.nextUrl.pathname.startsWith('/feed') || request.nextUrl.pathname.startsWith('/onboarding')

    if (!user && isProtectedPage && request.nextUrl.pathname!== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user && isAuthPage && request.nextUrl.pathname!== '/feed') {
      return NextResponse.redirect(new URL('/feed', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
