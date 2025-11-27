import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Discord OAuth2 authorization URL generator
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?redirect=/dashboard/settings', process.env.NEXT_PUBLIC_APP_URL!))
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`

  if (!clientId) {
    return NextResponse.json({ error: 'Discord integration not configured' }, { status: 500 })
  }

  // Generate state parameter to prevent CSRF
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    timestamp: Date.now(),
  })).toString('base64url')

  // Store state in cookie for validation
  const response = NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=identify&` +
    `state=${state}`
  )

  response.cookies.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}
