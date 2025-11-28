import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('[OAuth Callback] Starting...', {
    hasCode: !!code,
    redirect,
    error_param,
    error_description,
    origin
  })

  // Handle OAuth errors from provider
  if (error_param) {
    console.log('[OAuth Callback] Provider error:', error_param, error_description)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error_param)}`)
  }

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[OAuth Callback] Code exchange result:', { error: error?.message })

    if (!error) {
      // Get user to determine role
      const { data: { user } } = await supabase.auth.getUser()

      console.log('[OAuth Callback] User:', { userId: user?.id, email: user?.email })

      if (user) {
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        console.log('[OAuth Callback] Profile:', { role: profile?.role, profileError: profileError?.message })

        // If no profile exists, this is a new OAuth user - send to profile completion
        if (!profile?.role) {
          console.log('[OAuth Callback] No profile/role, redirecting to complete-profile')
          return NextResponse.redirect(`${origin}/complete-profile`)
        }

        // If there's a redirect param, use it
        if (redirect && redirect.startsWith('/')) {
          console.log('[OAuth Callback] Using redirect param:', redirect)
          return NextResponse.redirect(`${origin}${redirect}`)
        }

        // Redirect based on role
        console.log('[OAuth Callback] Redirecting based on role:', profile.role)
        if (profile.role === 'candidate') {
          return NextResponse.redirect(`${origin}/candidate`)
        } else if (profile.role === 'recruiter') {
          return NextResponse.redirect(`${origin}/recruiter`)
        } else if (profile.role === 'school_admin') {
          return NextResponse.redirect(`${origin}/school`)
        } else if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        } else {
          // Unknown role - send to complete profile
          return NextResponse.redirect(`${origin}/complete-profile`)
        }
      }

      // No user found after exchange - send to complete profile (OAuth new user)
      console.log('[OAuth Callback] No user after exchange, redirecting to complete-profile')
      return NextResponse.redirect(`${origin}/complete-profile`)
    } else {
      console.log('[OAuth Callback] Code exchange failed:', error.message)
    }
  }

  // Return the user to an error page with instructions
  console.log('[OAuth Callback] No code provided, redirecting to login with error')
  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
