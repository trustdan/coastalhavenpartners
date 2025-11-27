/**
 * Discord API helpers for moderation actions
 * These functions interact directly with Discord's REST API
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10'

function getHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    throw new Error('DISCORD_BOT_TOKEN is not configured')
  }
  return {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  }
}

function getGuildId() {
  const guildId = process.env.DISCORD_GUILD_ID
  if (!guildId) {
    throw new Error('DISCORD_GUILD_ID is not configured')
  }
  return guildId
}

/**
 * Ban a user from the Discord server
 */
export async function banFromDiscord(
  discordId: string,
  reason?: string,
  deleteMessageSeconds: number = 86400 // Delete last 24h of messages by default
): Promise<{ success: boolean; error?: string }> {
  try {
    const guildId = getGuildId()
    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/bans/${discordId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          delete_message_seconds: deleteMessageSeconds,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord ban failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Discord ban error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Unban a user from the Discord server
 */
export async function unbanFromDiscord(
  discordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const guildId = getGuildId()
    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/bans/${discordId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord unban failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Discord unban error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Kick a user from the Discord server
 */
export async function kickFromDiscord(
  discordId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const guildId = getGuildId()
    const headers: Record<string, string> = getHeaders()
    if (reason) {
      headers['X-Audit-Log-Reason'] = reason
    }

    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/members/${discordId}`,
      {
        method: 'DELETE',
        headers,
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord kick failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Discord kick error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Timeout (mute) a user in the Discord server
 * @param durationMinutes - Duration in minutes (max 28 days = 40320 minutes)
 */
export async function timeoutInDiscord(
  discordId: string,
  durationMinutes: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const guildId = getGuildId()
    const headers: Record<string, string> = getHeaders()
    if (reason) {
      headers['X-Audit-Log-Reason'] = reason
    }

    // Calculate timeout end time
    const timeoutUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()

    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/members/${discordId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          communication_disabled_until: timeoutUntil,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord timeout failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Discord timeout error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Remove timeout from a user
 */
export async function removeTimeoutFromDiscord(
  discordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const guildId = getGuildId()
    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/members/${discordId}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          communication_disabled_until: null,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord remove timeout failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Discord remove timeout error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send an embed message to a webhook (for mod logs)
 */
export async function sendModLogEmbed(embed: {
  title: string
  description: string
  color: number
  fields?: { name: string; value: string; inline?: boolean }[]
  thumbnail?: { url: string }
  footer?: { text: string }
}): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.DISCORD_MOD_LOG_WEBHOOK

  if (!webhookUrl) {
    console.warn('DISCORD_MOD_LOG_WEBHOOK not configured - skipping mod log')
    return { success: true } // Don't fail if webhook isn't configured
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          ...embed,
          timestamp: new Date().toISOString(),
        }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord webhook failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Discord webhook error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get information about a Discord user from the guild
 */
export async function getGuildMember(
  discordId: string
): Promise<{ success: boolean; member?: unknown; error?: string }> {
  try {
    const guildId = getGuildId()
    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/members/${discordId}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'User not in server' }
      }
      const error = await response.text()
      return { success: false, error }
    }

    const member = await response.json()
    return { success: true, member }
  } catch (error) {
    console.error('Discord get member error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Check if Discord integration is configured
 */
export function isDiscordConfigured(): boolean {
  return !!(
    process.env.DISCORD_BOT_TOKEN &&
    process.env.DISCORD_GUILD_ID
  )
}

/**
 * Color constants for embeds
 */
export const EMBED_COLORS = {
  SUCCESS: 0x00ff00, // Green
  WARNING: 0xffaa00, // Orange
  ERROR: 0xff0000,   // Red
  INFO: 0x0099ff,    // Blue
  BAN: 0xff0000,     // Red
  KICK: 0xff6600,    // Orange
  WARN: 0xffcc00,    // Yellow
  MUTE: 0x9900ff,    // Purple
  UNBAN: 0x00ff00,   // Green
} as const
