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

  // Protect /candidate, /recruiter, /school, and /admin routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/candidate') ||
      request.nextUrl.pathname.startsWith('/recruiter') ||
      request.nextUrl.pathname.startsWith('/school') ||
      request.nextUrl.pathname.startsWith('/admin')

  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Don't redirect if already on mfa-verify page
    if (request.nextUrl.pathname === '/mfa-verify') {
      return response
    }

    // Check if user has MFA enabled and needs to verify
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const hasMFA = factors?.totp?.some((f: { status: string }) => f.status === 'verified')

    if (hasMFA) {
      // User has MFA enabled - check if they've verified in this session
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
        // User needs to verify MFA
        const redirectPath = encodeURIComponent(request.nextUrl.pathname)
        return NextResponse.redirect(new URL(`/mfa-verify?redirect=${redirectPath}`, request.url))
      }
    }

    // Special admin-only checks
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

      if (profile?.role === 'admin' && !hasMFA) {
        // Admin doesn't have MFA - redirect to setup page (MFA is required for admins)
        return NextResponse.redirect(new URL('/admin/mfa-required', request.url))
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
      } else if (profile?.role === 'school_admin') {
        return NextResponse.redirect(new URL('/school', request.url))
      } else if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (!profile?.role) {
        // User has no profile yet - send to complete profile
        return NextResponse.redirect(new URL('/complete-profile', request.url))
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
    '/complete-profile/:path*',
    '/mfa-verify',
  ],
}
