import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/candidate'

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

        // Redirect based on role
        if (profile?.role === 'candidate') {
          return NextResponse.redirect(`${origin}/candidate`)
        } else if (profile?.role === 'recruiter') {
          return NextResponse.redirect(`${origin}/recruiter`)
        } else if (profile?.role === 'school_admin') {
          return NextResponse.redirect(`${origin}/school`)
        } else if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }

      // Default redirect
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
