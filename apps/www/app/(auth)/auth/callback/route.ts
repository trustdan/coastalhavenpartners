import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect')

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user to determine role
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // If no profile exists, this is a new OAuth user - send to profile completion
        if (!profile?.role) {
          return NextResponse.redirect(`${origin}/complete-profile`)
        }

        // If there's a redirect param, use it
        if (redirect && redirect.startsWith('/')) {
          return NextResponse.redirect(`${origin}${redirect}`)
        }

        // Redirect based on role
        if (profile.role === 'candidate') {
          return NextResponse.redirect(`${origin}/candidate`)
        } else if (profile.role === 'recruiter') {
          return NextResponse.redirect(`${origin}/recruiter`)
        } else if (profile.role === 'school_admin') {
          return NextResponse.redirect(`${origin}/school`)
        } else if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }

      // No user found after exchange - send to complete profile (OAuth new user)
      return NextResponse.redirect(`${origin}/complete-profile`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
