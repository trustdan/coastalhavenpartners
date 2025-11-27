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

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
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
