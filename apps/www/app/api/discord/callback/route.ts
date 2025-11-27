import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
}

async function getDiscordUser(code: string): Promise<DiscordUser> {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`

  // Exchange code for access token
  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const tokenData = await tokenResponse.json()

  // Get user info
  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  })

  if (!userResponse.ok) {
    throw new Error('Failed to fetch Discord user')
  }

  return userResponse.json()
}

async function notifyBotToAssignRole(discordId: string, role: string) {
  const botApiUrl = process.env.DISCORD_BOT_API_URL

  if (!botApiUrl) {
    console.warn('DISCORD_BOT_API_URL not configured - skipping role assignment')
    return
  }

  try {
    const response = await fetch(`${botApiUrl}/assign-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DISCORD_BOT_API_SECRET}`,
      },
      body: JSON.stringify({
        discord_id: discordId,
        role,
      }),
    })

    if (!response.ok) {
      console.error('Bot API returned error:', await response.text())
    }
  } catch (error) {
    console.error('Failed to notify bot:', error)
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const dashboardUrl = new URL('/dashboard/settings', process.env.NEXT_PUBLIC_APP_URL!)

  // Handle Discord OAuth errors
  if (error) {
    dashboardUrl.searchParams.set('discord', 'error')
    dashboardUrl.searchParams.set('message', error)
    return NextResponse.redirect(dashboardUrl)
  }

  if (!code || !state) {
    dashboardUrl.searchParams.set('discord', 'error')
    dashboardUrl.searchParams.set('message', 'missing_params')
    return NextResponse.redirect(dashboardUrl)
  }

  // Validate state
  const storedState = request.cookies.get('discord_oauth_state')?.value
  if (!storedState || storedState !== state) {
    dashboardUrl.searchParams.set('discord', 'error')
    dashboardUrl.searchParams.set('message', 'invalid_state')
    return NextResponse.redirect(dashboardUrl)
  }

  // Decode state to get user ID
  let stateData: { userId: string; timestamp: number }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
  } catch {
    dashboardUrl.searchParams.set('discord', 'error')
    dashboardUrl.searchParams.set('message', 'invalid_state_format')
    return NextResponse.redirect(dashboardUrl)
  }

  // Check state isn't expired (10 min)
  if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
    dashboardUrl.searchParams.set('discord', 'error')
    dashboardUrl.searchParams.set('message', 'state_expired')
    return NextResponse.redirect(dashboardUrl)
  }

  try {
    // Get Discord user info
    const discordUser = await getDiscordUser(code)

    // Verify current user matches state
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== stateData.userId) {
      dashboardUrl.searchParams.set('discord', 'error')
      dashboardUrl.searchParams.set('message', 'user_mismatch')
      return NextResponse.redirect(dashboardUrl)
    }

    // Check if this Discord account is already linked to another user
    const { data: existingLink } = await supabase
      .from('profiles')
      .select('id')
      .eq('discord_id', discordUser.id)
      .neq('id', user.id)
      .single()

    if (existingLink) {
      dashboardUrl.searchParams.set('discord', 'error')
      dashboardUrl.searchParams.set('message', 'already_linked')
      return NextResponse.redirect(dashboardUrl)
    }

    // Link Discord account to user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        discord_id: discordUser.id,
        discord_username: `${discordUser.username}`,
        discord_verified_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      dashboardUrl.searchParams.set('discord', 'error')
      dashboardUrl.searchParams.set('message', 'update_failed')
      return NextResponse.redirect(dashboardUrl)
    }

    // Get user's role to assign in Discord
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Notify bot to assign role
    if (profile) {
      await notifyBotToAssignRole(discordUser.id, profile.role)
    }

    // Clear state cookie and redirect with success
    const response = NextResponse.redirect(dashboardUrl)
    response.cookies.delete('discord_oauth_state')
    dashboardUrl.searchParams.set('discord', 'linked')

    return NextResponse.redirect(dashboardUrl)

  } catch (error) {
    console.error('Discord OAuth error:', error)
    dashboardUrl.searchParams.set('discord', 'error')
    dashboardUrl.searchParams.set('message', 'oauth_failed')
    return NextResponse.redirect(dashboardUrl)
  }
}
