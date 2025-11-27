import { createClient } from '@/lib/supabase/server'
import {
  banFromDiscord,
  unbanFromDiscord,
  kickFromDiscord,
  timeoutInDiscord,
  sendModLogEmbed,
  isDiscordConfigured,
  EMBED_COLORS,
} from '@/lib/discord/actions'
import { NextRequest, NextResponse } from 'next/server'

type ModerationAction = 'warn' | 'mute' | 'kick' | 'ban' | 'unban'

interface ModerateRequest {
  user_id: string
  action: ModerationAction
  reason?: string
  sync_discord?: boolean
  duration_minutes?: number // For mute/timeout
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user is admin
  const { data: admin } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: ModerateRequest = await request.json()
  const { user_id, action, reason, sync_discord, duration_minutes } = body

  if (!user_id || !action) {
    return NextResponse.json(
      { error: 'Missing required fields: user_id and action' },
      { status: 400 }
    )
  }

  // Get target user
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single()

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Can't moderate yourself
  if (targetUser.id === user.id) {
    return NextResponse.json(
      { error: 'Cannot moderate yourself' },
      { status: 400 }
    )
  }

  // Can't moderate other admins
  if (targetUser.role === 'admin') {
    return NextResponse.json(
      { error: 'Cannot moderate admin users' },
      { status: 400 }
    )
  }

  const shouldSyncDiscord = !!(sync_discord && targetUser.discord_id && isDiscordConfigured())

  // Prepare target user object with proper typing
  const targetUserData = {
    id: targetUser.id,
    discord_id: targetUser.discord_id,
    full_name: targetUser.full_name,
    email: targetUser.email,
    is_banned: targetUser.is_banned ?? false,
  }

  try {
    switch (action) {
      case 'warn':
        await handleWarn(supabase, user.id, targetUserData, reason, shouldSyncDiscord, admin?.full_name)
        break

      case 'mute':
        await handleMute(supabase, user.id, targetUserData, reason, shouldSyncDiscord, duration_minutes || 60, admin?.full_name)
        break

      case 'kick':
        await handleKick(supabase, user.id, targetUserData, reason, shouldSyncDiscord, admin?.full_name)
        break

      case 'ban':
        await handleBan(supabase, user.id, targetUserData, reason, shouldSyncDiscord, admin?.full_name)
        break

      case 'unban':
        await handleUnban(supabase, user.id, targetUserData, reason, shouldSyncDiscord, admin?.full_name)
        break

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, action, user_id })
  } catch (error) {
    console.error('Moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform moderation action' },
      { status: 500 }
    )
  }
}

async function handleWarn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moderatorId: string,
  targetUser: { id: string; discord_id: string | null; full_name: string; email: string; is_banned: boolean },
  reason: string | undefined,
  syncDiscord: boolean,
  moderatorName: string | undefined
) {
  // Log warning
  await supabase.from('moderation_actions').insert({
    target_user_id: targetUser.id,
    target_discord_id: targetUser.discord_id,
    moderator_id: moderatorId,
    action_type: 'warn',
    reason,
    platform: syncDiscord ? 'both' : 'website',
    is_active: true,
  })

  // Send to mod log if Discord sync enabled
  if (syncDiscord) {
    await sendModLogEmbed({
      title: 'User Warned',
      description: `**${targetUser.full_name}** has been warned`,
      color: EMBED_COLORS.WARN,
      fields: [
        { name: 'Email', value: targetUser.email, inline: true },
        { name: 'Moderator', value: moderatorName || 'Unknown', inline: true },
        { name: 'Reason', value: reason || 'No reason provided' },
      ],
    })
  }
}

async function handleMute(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moderatorId: string,
  targetUser: { id: string; discord_id: string | null; full_name: string; email: string },
  reason: string | undefined,
  syncDiscord: boolean,
  durationMinutes: number,
  moderatorName: string | undefined
) {
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()

  // Log mute
  await supabase.from('moderation_actions').insert({
    target_user_id: targetUser.id,
    target_discord_id: targetUser.discord_id,
    moderator_id: moderatorId,
    action_type: 'mute',
    reason,
    platform: syncDiscord ? 'both' : 'website',
    expires_at: expiresAt,
    is_active: true,
  })

  // Timeout in Discord
  if (syncDiscord && targetUser.discord_id) {
    await timeoutInDiscord(targetUser.discord_id, durationMinutes, reason)

    await sendModLogEmbed({
      title: 'User Muted',
      description: `**${targetUser.full_name}** has been muted for ${durationMinutes} minutes`,
      color: EMBED_COLORS.MUTE,
      fields: [
        { name: 'Email', value: targetUser.email, inline: true },
        { name: 'Moderator', value: moderatorName || 'Unknown', inline: true },
        { name: 'Duration', value: `${durationMinutes} minutes`, inline: true },
        { name: 'Reason', value: reason || 'No reason provided' },
      ],
    })
  }
}

async function handleKick(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moderatorId: string,
  targetUser: { id: string; discord_id: string | null; full_name: string; email: string },
  reason: string | undefined,
  syncDiscord: boolean,
  moderatorName: string | undefined
) {
  // Log kick
  await supabase.from('moderation_actions').insert({
    target_user_id: targetUser.id,
    target_discord_id: targetUser.discord_id,
    moderator_id: moderatorId,
    action_type: 'kick',
    reason,
    platform: syncDiscord ? 'both' : 'website',
    is_active: true,
  })

  // Kick from Discord
  if (syncDiscord && targetUser.discord_id) {
    await kickFromDiscord(targetUser.discord_id, reason)

    await sendModLogEmbed({
      title: 'User Kicked',
      description: `**${targetUser.full_name}** has been kicked from the server`,
      color: EMBED_COLORS.KICK,
      fields: [
        { name: 'Email', value: targetUser.email, inline: true },
        { name: 'Moderator', value: moderatorName || 'Unknown', inline: true },
        { name: 'Reason', value: reason || 'No reason provided' },
      ],
    })
  }
}

async function handleBan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moderatorId: string,
  targetUser: { id: string; discord_id: string | null; full_name: string; email: string; is_banned?: boolean },
  reason: string | undefined,
  syncDiscord: boolean,
  moderatorName: string | undefined
) {
  // Skip if already banned
  if (targetUser.is_banned) {
    throw new Error('User is already banned')
  }

  // Ban on website
  await supabase
    .from('profiles')
    .update({
      is_banned: true,
      banned_at: new Date().toISOString(),
      banned_by: moderatorId,
      ban_reason: reason || 'Banned by admin',
    })
    .eq('id', targetUser.id)

  // Log ban
  await supabase.from('moderation_actions').insert({
    target_user_id: targetUser.id,
    target_discord_id: targetUser.discord_id,
    moderator_id: moderatorId,
    action_type: 'ban',
    reason,
    platform: syncDiscord ? 'both' : 'website',
    is_active: true,
  })

  // Ban from Discord
  if (syncDiscord && targetUser.discord_id) {
    await banFromDiscord(targetUser.discord_id, reason)

    await sendModLogEmbed({
      title: 'User Banned',
      description: `**${targetUser.full_name}** has been banned`,
      color: EMBED_COLORS.BAN,
      fields: [
        { name: 'Email', value: targetUser.email, inline: true },
        { name: 'Moderator', value: moderatorName || 'Unknown', inline: true },
        { name: 'Platform', value: 'Website + Discord', inline: true },
        { name: 'Reason', value: reason || 'No reason provided' },
      ],
    })
  }
}

async function handleUnban(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moderatorId: string,
  targetUser: { id: string; discord_id: string | null; full_name: string; email: string; is_banned?: boolean },
  reason: string | undefined,
  syncDiscord: boolean,
  moderatorName: string | undefined
) {
  // Skip if not banned
  if (!targetUser.is_banned) {
    throw new Error('User is not banned')
  }

  // Unban on website
  await supabase
    .from('profiles')
    .update({
      is_banned: false,
      banned_at: null,
      banned_by: null,
      ban_reason: null,
    })
    .eq('id', targetUser.id)

  // Log unban
  await supabase.from('moderation_actions').insert({
    target_user_id: targetUser.id,
    target_discord_id: targetUser.discord_id,
    moderator_id: moderatorId,
    action_type: 'unban',
    reason,
    platform: syncDiscord ? 'both' : 'website',
    is_active: true,
  })

  // Unban from Discord
  if (syncDiscord && targetUser.discord_id) {
    await unbanFromDiscord(targetUser.discord_id)

    await sendModLogEmbed({
      title: 'User Unbanned',
      description: `**${targetUser.full_name}** has been unbanned`,
      color: EMBED_COLORS.UNBAN,
      fields: [
        { name: 'Email', value: targetUser.email, inline: true },
        { name: 'Moderator', value: moderatorName || 'Unknown', inline: true },
        { name: 'Platform', value: 'Website + Discord', inline: true },
        { name: 'Reason', value: reason || 'No reason provided' },
      ],
    })
  }
}

/**
 * GET - Fetch moderation history for a user
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: admin } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = request.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    )
  }

  // Get user info
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('discord_id')
    .eq('id', userId)
    .single()

  // Get moderation history (match by user_id OR discord_id)
  const query = supabase
    .from('moderation_actions')
    .select(`
      *,
      moderator:profiles!moderation_actions_moderator_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (targetUser?.discord_id) {
    query.or(`target_user_id.eq.${userId},target_discord_id.eq.${targetUser.discord_id}`)
  } else {
    query.eq('target_user_id', userId)
  }

  const { data: actions, error } = await query

  if (error) {
    console.error('Failed to fetch mod history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moderation history' },
      { status: 500 }
    )
  }

  return NextResponse.json({ actions })
}
