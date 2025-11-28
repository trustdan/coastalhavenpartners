import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /candidate, /recruiter, and /admin routes
  if (request.nextUrl.pathname.startsWith('/candidate') ||
      request.nextUrl.pathname.startsWith('/recruiter') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check admin MFA requirement
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Don't redirect if already on mfa-required page
      if (request.nextUrl.pathname === '/admin/mfa-required') {
        return response
      }

      // Get user's profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        // Check if admin has MFA enabled
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const hasMFA = factors?.totp?.some((f: { status: string }) => f.status === 'verified')

        if (!hasMFA) {
          // Admin doesn't have MFA - redirect to setup page
          return NextResponse.redirect(new URL('/admin/mfa-required', request.url))
        }

        // Check MFA assurance level
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        if (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
          // Admin needs to verify MFA
          return NextResponse.redirect(new URL('/mfa-verify?redirect=/admin', request.url))
        }
      }
    }
  }

  // Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) {
    if (user) {
      // Check user role and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'candidate') {
        return NextResponse.redirect(new URL('/candidate', request.url))
      } else if (profile?.role === 'recruiter') {
        return NextResponse.redirect(new URL('/recruiter', request.url))
      } else if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/candidate/:path*',
    '/recruiter/:path*',
    '/admin/:path*',
    '/school/:path*',
    '/login',
    '/signup/:path*',
    '/mfa-verify',
  ],
}
