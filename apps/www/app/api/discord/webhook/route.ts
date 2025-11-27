import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create Supabase client lazily to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Discord Webhook Endpoint
 *
 * Receives events from:
 * 1. YAGPDB/Wick moderation logs (via webhook)
 * 2. Custom Discord bot events
 *
 * Expected payload format:
 * {
 *   type: 'REPORT' | 'MOD_ACTION' | 'USER_JOIN' | 'USER_LEAVE',
 *   ...event-specific data
 * }
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  const webhookSecret = request.headers.get('x-webhook-secret')
  if (webhookSecret !== process.env.DISCORD_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

  try {
    switch (payload.type) {
      case 'REPORT':
        await handleReport(payload)
        break
      case 'MOD_ACTION':
        await handleModAction(payload)
        break
      case 'USER_JOIN':
        await handleUserJoin(payload)
        break
      case 'USER_LEAVE':
        await handleUserLeave(payload)
        break
      case 'BAN_ADD':
        await handleBanAdd(payload)
        break
      case 'BAN_REMOVE':
        await handleBanRemove(payload)
        break
      default:
        console.log('Unknown webhook event type:', payload.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle user report from Discord
 */
async function handleReport(payload: {
  reporter_discord_id: string
  reported_discord_id: string
  reason: string
  message_content?: string
  message_link?: string
  channel_id?: string
}) {
  // Look up if users are linked to website accounts
  const supabase = getSupabase()
  const { data: reporter } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_id', payload.reporter_discord_id)
    .single()

  const { data: reported } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_id', payload.reported_discord_id)
    .single()

  // Create report record
  const { error } = await supabase.from('discord_reports').insert({
    reporter_discord_id: payload.reporter_discord_id,
    reporter_user_id: reporter?.id || null,
    reported_discord_id: payload.reported_discord_id,
    reported_user_id: reported?.id || null,
    reason: payload.reason,
    message_content: payload.message_content,
    message_link: payload.message_link,
    channel_id: payload.channel_id,
    status: 'pending',
  })

  if (error) {
    console.error('Failed to create report:', error)
    throw error
  }

  console.log(`Report created: ${payload.reported_discord_id} by ${payload.reporter_discord_id}`)
}

/**
 * Handle moderation action from Discord (e.g., from YAGPDB logs)
 */
async function handleModAction(payload: {
  target_discord_id: string
  moderator_discord_id: string
  action_type: 'warn' | 'mute' | 'kick' | 'ban' | 'unban'
  reason?: string
  duration_minutes?: number
}) {
  const supabase = getSupabase()
  // Look up linked accounts
  const { data: target } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_id', payload.target_discord_id)
    .single()

  const { data: moderator } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_id', payload.moderator_discord_id)
    .single()

  // Calculate expiry for temporary actions
  let expiresAt: string | null = null
  if (payload.duration_minutes && ['mute'].includes(payload.action_type)) {
    expiresAt = new Date(Date.now() + payload.duration_minutes * 60 * 1000).toISOString()
  }

  // Log the moderation action
  const { error: actionError } = await supabase.from('moderation_actions').insert({
    target_user_id: target?.id || null,
    target_discord_id: payload.target_discord_id,
    moderator_id: moderator?.id || null,
    moderator_discord_id: payload.moderator_discord_id,
    action_type: payload.action_type,
    reason: payload.reason,
    platform: 'discord',
    expires_at: expiresAt,
    is_active: true,
  })

  if (actionError) {
    console.error('Failed to log mod action:', actionError)
    throw actionError
  }

  // If it's a ban and user is linked, ban on website too
  if (payload.action_type === 'ban' && target) {
    const { error: banError } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_by: moderator?.id || null,
        ban_reason: payload.reason || 'Banned from Discord server',
      })
      .eq('id', target.id)

    if (banError) {
      console.error('Failed to ban user on website:', banError)
    } else {
      console.log(`User ${target.id} banned on website due to Discord ban`)
    }
  }

  // If it's an unban and user is linked, unban on website too
  if (payload.action_type === 'unban' && target) {
    const { error: unbanError } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        banned_at: null,
        banned_by: null,
        ban_reason: null,
      })
      .eq('id', target.id)

    if (unbanError) {
      console.error('Failed to unban user on website:', unbanError)
    } else {
      console.log(`User ${target.id} unbanned on website due to Discord unban`)
    }
  }

  console.log(`Mod action logged: ${payload.action_type} on ${payload.target_discord_id}`)
}

/**
 * Handle user join event - check if they're banned on website
 */
async function handleUserJoin(payload: { discord_id: string }) {
  const supabase = getSupabase()
  // Check if user has linked account and is banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned, ban_reason')
    .eq('discord_id', payload.discord_id)
    .single()

  if (profile?.is_banned) {
    console.log(`Banned user ${payload.discord_id} joined Discord - should be kicked`)
    // Return info so the bot can kick them
    return { should_kick: true, reason: profile.ban_reason }
  }

  return { should_kick: false }
}

/**
 * Handle user leave event - log for analytics
 */
async function handleUserLeave(payload: {
  discord_id: string
  reason?: 'left' | 'kicked' | 'banned'
}) {
  console.log(`User ${payload.discord_id} left Discord (${payload.reason || 'unknown'})`)
  // Could log to analytics_events if needed
}

/**
 * Handle Discord ban add event (from Discord audit log)
 */
async function handleBanAdd(payload: {
  discord_id: string
  moderator_discord_id?: string
  reason?: string
}) {
  const supabase = getSupabase()
  // Look up linked account
  const { data: target } = await supabase
    .from('profiles')
    .select('id, is_banned')
    .eq('discord_id', payload.discord_id)
    .single()

  if (!target) {
    console.log(`Discord ban for unlinked user: ${payload.discord_id}`)
    return
  }

  // Skip if already banned
  if (target.is_banned) {
    console.log(`User ${target.id} already banned on website`)
    return
  }

  // Look up moderator
  const { data: moderator } = payload.moderator_discord_id
    ? await supabase
        .from('profiles')
        .select('id')
        .eq('discord_id', payload.moderator_discord_id)
        .single()
    : { data: null }

  // Ban on website
  const { error } = await supabase
    .from('profiles')
    .update({
      is_banned: true,
      banned_at: new Date().toISOString(),
      banned_by: moderator?.id || null,
      ban_reason: payload.reason || 'Banned from Discord server',
    })
    .eq('id', target.id)

  if (error) {
    console.error('Failed to sync ban to website:', error)
  } else {
    console.log(`Synced Discord ban to website for user ${target.id}`)
  }

  // Log the action
  await supabase.from('moderation_actions').insert({
    target_user_id: target.id,
    target_discord_id: payload.discord_id,
    moderator_id: moderator?.id || null,
    moderator_discord_id: payload.moderator_discord_id,
    action_type: 'ban',
    reason: payload.reason || 'Banned from Discord server',
    platform: 'discord',
    is_active: true,
  })
}

/**
 * Handle Discord ban remove event
 */
async function handleBanRemove(payload: {
  discord_id: string
  moderator_discord_id?: string
}) {
  const supabase = getSupabase()
  // Look up linked account
  const { data: target } = await supabase
    .from('profiles')
    .select('id, is_banned')
    .eq('discord_id', payload.discord_id)
    .single()

  if (!target || !target.is_banned) {
    return
  }

  // Unban on website
  const { error } = await supabase
    .from('profiles')
    .update({
      is_banned: false,
      banned_at: null,
      banned_by: null,
      ban_reason: null,
    })
    .eq('id', target.id)

  if (error) {
    console.error('Failed to sync unban to website:', error)
  } else {
    console.log(`Synced Discord unban to website for user ${target.id}`)
  }

  // Log the action
  const { data: moderator } = payload.moderator_discord_id
    ? await supabase
        .from('profiles')
        .select('id')
        .eq('discord_id', payload.moderator_discord_id)
        .single()
    : { data: null }

  await supabase.from('moderation_actions').insert({
    target_user_id: target.id,
    target_discord_id: payload.discord_id,
    moderator_id: moderator?.id || null,
    moderator_discord_id: payload.moderator_discord_id,
    action_type: 'unban',
    reason: 'Unbanned from Discord server',
    platform: 'discord',
    is_active: true,
  })
}
