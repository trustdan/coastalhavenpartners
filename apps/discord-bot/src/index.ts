import 'dotenv/config'
import { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } from 'discord.js'
import express from 'express'
import { createClient } from '@supabase/supabase-js'

// Environment validation
const requiredEnvVars = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_CLIENT_ID',
  'DISCORD_GUILD_ID',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'BOT_API_SECRET',
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Role IDs (set these after creating roles in Discord)
const ROLE_IDS = {
  unverified: process.env.DISCORD_UNVERIFIED_ROLE_ID!,
  candidate: process.env.DISCORD_CANDIDATE_ROLE_ID!,
  recruiter: process.env.DISCORD_RECRUITER_ROLE_ID!,
  school_admin: process.env.DISCORD_CAREER_SERVICES_ROLE_ID!,
  admin: process.env.DISCORD_ADMIN_ROLE_ID!,
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Webhook configuration for syncing moderation to website
const WEBSITE_WEBHOOK_URL = process.env.WEBSITE_WEBHOOK_URL // e.g., https://yoursite.com/api/discord/webhook
const WEBSITE_WEBHOOK_SECRET = process.env.WEBSITE_WEBHOOK_SECRET

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration, // For ban/unban events
  ],
})

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Link your Discord account to your Coastal Haven Partners profile'),
  new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your linked profile status'),
].map(command => command.toJSON())

async function registerCommands() {
  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)

  try {
    console.log('Registering slash commands...')
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_GUILD_ID!
      ),
      { body: commands }
    )
    console.log('Slash commands registered successfully')
  } catch (error) {
    console.error('Failed to register slash commands:', error)
  }
}

// Discord event handlers
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Discord bot ready! Logged in as ${readyClient.user.tag}`)
  await registerCommands()
})

client.on(Events.GuildMemberAdd, async (member) => {
  // Assign unverified role to new members
  if (ROLE_IDS.unverified) {
    try {
      await member.roles.add(ROLE_IDS.unverified)
      console.log(`Assigned unverified role to ${member.user.tag}`)
    } catch (error) {
      console.error(`Failed to assign unverified role to ${member.user.tag}:`, error)
    }
  }

  // Send welcome DM with verification instructions
  try {
    await member.send({
      content: `Welcome to Coastal Haven Partners!

To access the full server, please verify your account by linking it to your profile on our website.

**How to verify:**
1. Log in to your account at ${process.env.WEBSITE_URL || 'https://coastalhavenpartners.com'}
2. Go to Settings > Discord Integration
3. Click "Link Discord Account"

If you don't have an account yet, sign up first at our website!

Use \`/verify\` in the server if you need these instructions again.`
    })
  } catch (error) {
    // User might have DMs disabled
    console.log(`Could not DM ${member.user.tag} - DMs may be disabled`)
  }
})

// Helper function to send events to website webhook
async function sendWebhookEvent(type: string, payload: Record<string, unknown>) {
  if (!WEBSITE_WEBHOOK_URL || !WEBSITE_WEBHOOK_SECRET) {
    console.log(`Skipping webhook (not configured): ${type}`)
    return
  }

  try {
    const response = await fetch(WEBSITE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBSITE_WEBHOOK_SECRET,
      },
      body: JSON.stringify({ type, ...payload }),
    })

    if (!response.ok) {
      console.error(`Webhook failed for ${type}:`, await response.text())
    } else {
      console.log(`Webhook sent: ${type}`)
    }
  } catch (error) {
    console.error(`Webhook error for ${type}:`, error)
  }
}

// Moderation events - sync bans to website
client.on(Events.GuildBanAdd, async (ban) => {
  console.log(`User banned: ${ban.user.tag} (${ban.user.id})`)

  // Try to get the moderator from audit log
  let moderatorId: string | undefined
  let reason: string | undefined

  try {
    const auditLogs = await ban.guild.fetchAuditLogs({
      type: 22, // MEMBER_BAN_ADD
      limit: 1,
    })
    const banLog = auditLogs.entries.first()

    if (banLog && banLog.target?.id === ban.user.id) {
      moderatorId = banLog.executor?.id
      reason = banLog.reason || undefined
    }
  } catch (error) {
    console.error('Failed to fetch audit log for ban:', error)
  }

  // Send to website webhook
  await sendWebhookEvent('BAN_ADD', {
    discord_id: ban.user.id,
    moderator_discord_id: moderatorId,
    reason,
  })
})

client.on(Events.GuildBanRemove, async (ban) => {
  console.log(`User unbanned: ${ban.user.tag} (${ban.user.id})`)

  // Try to get the moderator from audit log
  let moderatorId: string | undefined

  try {
    const auditLogs = await ban.guild.fetchAuditLogs({
      type: 23, // MEMBER_BAN_REMOVE
      limit: 1,
    })
    const unbanLog = auditLogs.entries.first()

    if (unbanLog && unbanLog.target?.id === ban.user.id) {
      moderatorId = unbanLog.executor?.id
    }
  } catch (error) {
    console.error('Failed to fetch audit log for unban:', error)
  }

  // Send to website webhook
  await sendWebhookEvent('BAN_REMOVE', {
    discord_id: ban.user.id,
    moderator_discord_id: moderatorId,
  })
})

// Track member removals (could be kick or leave)
client.on(Events.GuildMemberRemove, async (member) => {
  // Check audit log to see if this was a kick
  try {
    const auditLogs = await member.guild.fetchAuditLogs({
      type: 20, // MEMBER_KICK
      limit: 1,
    })
    const kickLog = auditLogs.entries.first()

    // Check if this kick was for this member and recent (within 5 seconds)
    if (
      kickLog &&
      kickLog.target?.id === member.user.id &&
      kickLog.createdTimestamp > Date.now() - 5000
    ) {
      console.log(`User kicked: ${member.user.tag} (${member.user.id})`)

      await sendWebhookEvent('MOD_ACTION', {
        target_discord_id: member.user.id,
        moderator_discord_id: kickLog.executor?.id,
        action_type: 'kick',
        reason: kickLog.reason || undefined,
      })
    } else {
      // User left on their own
      await sendWebhookEvent('USER_LEAVE', {
        discord_id: member.user.id,
        reason: 'left',
      })
    }
  } catch (error) {
    console.error('Failed to check kick audit log:', error)
    // Still log the leave event
    await sendWebhookEvent('USER_LEAVE', {
      discord_id: member.user.id,
      reason: 'unknown',
    })
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'verify') {
    await interaction.reply({
      content: `**Link your Discord account**

Click the link below to connect your Discord to your Coastal Haven Partners profile:

${process.env.WEBSITE_URL || 'https://coastalhavenpartners.com'}/dashboard/settings?connect=discord

Once linked, you'll automatically receive the appropriate role based on your account type.`,
      ephemeral: true, // Only visible to the user
    })
  }

  if (interaction.commandName === 'profile') {
    // Check if user is linked in database
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, discord_verified_at')
      .eq('discord_id', interaction.user.id)
      .single()

    if (profile) {
      await interaction.reply({
        content: `**Your Linked Profile**

Name: ${profile.full_name}
Account Type: ${profile.role}
Verified: ${profile.discord_verified_at ? new Date(profile.discord_verified_at).toLocaleDateString() : 'Yes'}`,
        ephemeral: true,
      })
    } else {
      await interaction.reply({
        content: `Your Discord account is not linked to a Coastal Haven Partners profile.

Use \`/verify\` to get started!`,
        ephemeral: true,
      })
    }
  }
})

// Express API for receiving role assignment requests from the website
const app = express()
app.use(express.json())

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// API authentication middleware
function authenticateRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${process.env.BOT_API_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

// Endpoint to assign roles after OAuth verification
app.post('/assign-role', authenticateRequest, async (req, res) => {
  const { discord_id, role } = req.body

  if (!discord_id || !role) {
    res.status(400).json({ error: 'Missing discord_id or role' })
    return
  }

  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
    const member = await guild.members.fetch(discord_id)

    // Remove unverified role
    if (ROLE_IDS.unverified && member.roles.cache.has(ROLE_IDS.unverified)) {
      await member.roles.remove(ROLE_IDS.unverified)
    }

    // Assign appropriate role based on user type
    const roleId = role === 'candidate' ? ROLE_IDS.candidate
                 : role === 'recruiter' ? ROLE_IDS.recruiter
                 : role === 'school_admin' ? ROLE_IDS.school_admin
                 : role === 'admin' ? ROLE_IDS.admin
                 : null

    if (roleId) {
      await member.roles.add(roleId)
    }

    // Send confirmation DM
    try {
      await member.send({
        content: `Your Discord account has been successfully linked to your Coastal Haven Partners profile! You now have access to all channels.`
      })
    } catch {
      // DMs disabled
    }

    console.log(`Assigned ${role} role to Discord user ${discord_id}`)
    res.json({ success: true, role })

  } catch (error) {
    console.error('Failed to assign role:', error)
    res.status(500).json({ error: 'Failed to assign role' })
  }
})

// Endpoint to remove roles (for unlinking or account deletion)
app.post('/remove-role', authenticateRequest, async (req, res) => {
  const { discord_id } = req.body

  if (!discord_id) {
    res.status(400).json({ error: 'Missing discord_id' })
    return
  }

  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
    const member = await guild.members.fetch(discord_id)

    // Remove all verified roles
    const rolesToRemove = [ROLE_IDS.candidate, ROLE_IDS.recruiter, ROLE_IDS.school_admin, ROLE_IDS.admin].filter(Boolean)
    for (const roleId of rolesToRemove) {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId)
      }
    }

    // Re-add unverified role
    if (ROLE_IDS.unverified) {
      await member.roles.add(ROLE_IDS.unverified)
    }

    console.log(`Removed roles from Discord user ${discord_id}`)
    res.json({ success: true })

  } catch (error) {
    console.error('Failed to remove role:', error)
    res.status(500).json({ error: 'Failed to remove role' })
  }
})

// Start the bot and API server
const PORT = process.env.PORT || 3001

async function start() {
  // Connect to Discord
  await client.login(process.env.DISCORD_BOT_TOKEN)

  // Start Express API
  app.listen(PORT, () => {
    console.log(`Bot API server running on port ${PORT}`)
  })
}

start().catch(console.error)
