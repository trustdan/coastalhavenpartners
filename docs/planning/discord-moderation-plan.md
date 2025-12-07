# Discord Moderation Integration Plan

This document outlines the complete plan for integrating Discord moderation with the Coastal Haven Partners platform, enabling synchronized user management across both systems.

---

## Table of Contents

1. [Overview](#overview)
2. [Build vs Buy: Bot Decision](#build-vs-buy-bot-decision)
3. [Database Schema Changes](#database-schema-changes)
4. [Discord Bot Setup](#discord-bot-setup)
5. [Discord OAuth Integration](#discord-oauth-integration)
6. [Webhook Architecture](#webhook-architecture)
7. [Admin UI Updates](#admin-ui-updates)
8. [Moderation Workflow](#moderation-workflow)
9. [Implementation Phases](#implementation-phases)

---

## Overview

### Goals

1. **Link Discord accounts to website profiles** - Users verify their Discord in the app
2. **Unified moderation** - Actions taken on one platform reflect on the other
3. **Mod visibility** - Admins can see Discord info and history in the admin panel
4. **Automated enforcement** - Bans/suspensions sync automatically
5. **Audit trail** - All moderation actions are logged

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Coastal Haven Partners                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐ │
│  │   Website    │     │  Admin Panel │     │    Supabase Database     │ │
│  │              │     │              │     │                          │ │
│  │ - Link       │     │ - View users │     │ - profiles (discord_id)  │ │
│  │   Discord    │     │ - See Discord│     │ - moderation_actions     │ │
│  │ - OAuth flow │     │ - Ban/Suspend│     │ - discord_reports        │ │
│  └──────┬───────┘     └──────┬───────┘     └────────────┬─────────────┘ │
│         │                    │                          │                │
│         └────────────────────┼──────────────────────────┘                │
│                              │                                           │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   API Endpoints     │
                    │                     │
                    │ /api/discord/oauth  │
                    │ /api/discord/webhook│
                    │ /api/admin/moderate │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌────────────┐ ┌─────────────────┐
    │  Discord Bot    │ │  Discord   │ │  Discord API    │
    │  (Custom/Wick)  │ │  Server    │ │  (Ban/Kick)     │
    │                 │ │            │ │                 │
    │ - /lookup       │ │ - Reports  │ │ - OAuth2        │
    │ - /warn         │ │ - Mod logs │ │ - Guild actions │
    │ - /ban          │ │ - Roles    │ │                 │
    └─────────────────┘ └────────────┘ └─────────────────┘
```

---

## Build vs Buy: Bot Decision

### Option A: Dedicated Service (Recommended for Starting)

**Best options for moderation bots:**

| Service | Cost | Pros | Cons |
|---------|------|------|------|
| **Wick** | Free tier available | Powerful anti-raid, logging, auto-mod | Less customizable |
| **Carl-bot** | Free | Great logging, reaction roles | Limited moderation sync |
| **Dyno** | Free tier | Good moderation, auto-mod | Can't sync with external DB |
| **MEE6** | Free/$12/mo | Easy setup, leveling | Limited API access |
| **Custom Bot** | Hosting costs | Full control, DB sync | Development time |

**Recommendation: Hybrid Approach**

1. **Use Wick or Carl-bot** for day-to-day moderation (auto-mod, logging, basic commands)
2. **Build a lightweight custom bot** for:
   - `/lookup` command (links to website profile)
   - Webhook listener (sends reports to your admin panel)
   - Sync actions from admin panel → Discord

This gives you the best of both worlds: battle-tested moderation + custom integration.

### Option B: Fully Custom Bot

Build everything from scratch if you need:
- Deep database integration
- Custom moderation workflows
- White-label solution
- Full control over data

**Tech stack for custom bot:**
- **Runtime:** Node.js or Python
- **Library:** discord.js (Node) or discord.py (Python)
- **Hosting:** Railway, Render, or Fly.io (~$5-10/mo)
- **Database:** Connect directly to Supabase

---

## Database Schema Changes

### Migration: Add Moderation Tables

```sql
-- File: supabase/migrations/20251128000000_discord_moderation.sql

-- =============================================
-- MODERATION ACTIONS TABLE
-- =============================================

CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target user
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_discord_id TEXT, -- Store even if not linked (for Discord-only actions)

  -- Moderator
  moderator_id UUID REFERENCES public.profiles(id),
  moderator_discord_id TEXT,

  -- Action details
  action_type TEXT NOT NULL, -- 'warn', 'mute', 'kick', 'ban', 'unban', 'note'
  reason TEXT,
  evidence_urls TEXT[], -- Screenshots, message links

  -- Scope
  platform TEXT NOT NULL DEFAULT 'both', -- 'discord', 'website', 'both'

  -- Duration (for temporary actions)
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  discord_message_id TEXT, -- Reference to original reported message
  discord_channel_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_mod_actions_target ON moderation_actions(target_user_id);
CREATE INDEX idx_mod_actions_discord ON moderation_actions(target_discord_id);
CREATE INDEX idx_mod_actions_type ON moderation_actions(action_type);
CREATE INDEX idx_mod_actions_active ON moderation_actions(is_active) WHERE is_active = TRUE;

-- =============================================
-- DISCORD REPORTS TABLE
-- =============================================

CREATE TABLE public.discord_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reporter
  reporter_discord_id TEXT NOT NULL,
  reporter_user_id UUID REFERENCES public.profiles(id), -- If linked

  -- Reported user
  reported_discord_id TEXT NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id), -- If linked

  -- Report details
  reason TEXT NOT NULL,
  message_content TEXT,
  message_link TEXT,
  channel_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned', 'dismissed'
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Link to action taken (if any)
  action_id UUID REFERENCES public.moderation_actions(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pending reports
CREATE INDEX idx_reports_status ON discord_reports(status);
CREATE INDEX idx_reports_reported ON discord_reports(reported_discord_id);

-- =============================================
-- ADD BAN FIELDS TO PROFILES
-- =============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;

-- Index for banned users
CREATE INDEX idx_profiles_banned ON public.profiles(is_banned) WHERE is_banned = TRUE;

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage moderation actions
CREATE POLICY "Admins can manage moderation actions"
  ON public.moderation_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can view/manage reports
CREATE POLICY "Admins can manage discord reports"
  ON public.discord_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can see if they are banned (read own profile - existing policy covers this)
```

### Update database.types.ts

After running the migration, regenerate types:

```bash
pnpm supabase gen types typescript --local > apps/www/lib/types/database.types.ts
```

---

## Discord Bot Setup

### Option 1: Lightweight Custom Bot (Recommended)

Create a simple bot that handles the integration points:

**File structure:**
```
discord-bot/
├── src/
│   ├── index.ts          # Bot entry point
│   ├── commands/
│   │   ├── lookup.ts     # /lookup @user
│   │   ├── warn.ts       # /warn @user [reason]
│   │   ├── ban.ts        # /ban @user [reason]
│   │   └── history.ts    # /history @user
│   ├── events/
│   │   ├── ready.ts
│   │   └── interactionCreate.ts
│   └── lib/
│       ├── supabase.ts   # Supabase client
│       └── discord.ts    # Discord API helpers
├── package.json
└── .env
```

**Core bot code (src/index.ts):**

```typescript
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js'
import { createClient } from '@supabase/supabase-js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ]
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Slash commands
const commands = [
  {
    name: 'lookup',
    description: 'Look up a user\'s website profile',
    options: [{
      name: 'user',
      description: 'The Discord user to look up',
      type: 6, // USER type
      required: true
    }]
  },
  {
    name: 'warn',
    description: 'Warn a user',
    options: [
      { name: 'user', description: 'User to warn', type: 6, required: true },
      { name: 'reason', description: 'Reason for warning', type: 3, required: true }
    ]
  },
  {
    name: 'history',
    description: 'View moderation history for a user',
    options: [{
      name: 'user',
      description: 'The user to check',
      type: 6,
      required: true
    }]
  }
]

client.on('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}`)

  // Register commands
  const rest = new REST().setToken(process.env.DISCORD_TOKEN!)
  await rest.put(
    Routes.applicationGuildCommands(client.user!.id, process.env.GUILD_ID!),
    { body: commands }
  )
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'lookup') {
    const user = interaction.options.getUser('user')!

    // Look up in Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('discord_id', user.id)
      .single()

    if (!profile) {
      await interaction.reply({
        content: `No linked account found for ${user.tag}`,
        ephemeral: true
      })
      return
    }

    // Get moderation history count
    const { count } = await supabase
      .from('moderation_actions')
      .select('*', { count: 'exact', head: true })
      .eq('target_discord_id', user.id)

    await interaction.reply({
      embeds: [{
        title: `Profile: ${profile.full_name}`,
        fields: [
          { name: 'Email', value: profile.email, inline: true },
          { name: 'Role', value: profile.role, inline: true },
          { name: 'Banned', value: profile.is_banned ? 'Yes' : 'No', inline: true },
          { name: 'Mod Actions', value: String(count || 0), inline: true },
          { name: 'Admin Link', value: `[View in Admin](${process.env.APP_URL}/admin/users/${profile.id})` }
        ],
        color: profile.is_banned ? 0xff0000 : 0x00ff00
      }],
      ephemeral: true
    })
  }

  // ... other commands
})

client.login(process.env.DISCORD_TOKEN)
```

**Environment variables (.env):**
```
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
GUILD_ID=your_server_id
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
APP_URL=https://coastalhavenpartners.com
```

### Option 2: Use Wick + Webhook Integration

If using Wick for main moderation:

1. **Set up Wick** in your server (wickbot.com)
2. **Configure logging** to post to a mod-log channel
3. **Create a webhook** in that channel
4. **Point webhook to your API** to capture events

---

## Discord OAuth Integration

### Add OAuth Route

**File: `app/api/auth/discord/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Build Discord OAuth URL
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds.join',
    state: user.id, // Pass user ID to callback
  })

  return NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params}`
  )
}
```

**File: `app/api/auth/discord/callback/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const userId = request.nextUrl.searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/profile?error=discord_failed', request.url))
  }

  // Exchange code for token
  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
    }),
  })

  const tokens = await tokenResponse.json()

  // Get Discord user info
  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  const discordUser = await userResponse.json()

  // Update profile with Discord info
  const supabase = await createClient()
  await supabase
    .from('profiles')
    .update({
      discord_id: discordUser.id,
      discord_username: `${discordUser.username}`,
      discord_verified_at: new Date().toISOString(),
    })
    .eq('id', userId)

  // Optional: Add to Discord server with role
  // await addToGuildWithRole(discordUser.id, tokens.access_token)

  return NextResponse.redirect(new URL('/profile?discord=linked', request.url))
}
```

### Profile UI Component

**File: `components/profile/discord-link.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DiscordLinkProps {
  discordUsername: string | null
  discordVerifiedAt: string | null
}

export function DiscordLink({ discordUsername, discordVerifiedAt }: DiscordLinkProps) {
  if (discordUsername) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <DiscordIcon className="h-5 w-5" />
          <span>{discordUsername}</span>
        </div>
        <Badge variant="secondary">
          Linked {new Date(discordVerifiedAt!).toLocaleDateString()}
        </Badge>
        <Button variant="ghost" size="sm" asChild>
          <a href="/api/auth/discord/unlink">Unlink</a>
        </Button>
      </div>
    )
  }

  return (
    <Button asChild>
      <a href="/api/auth/discord">
        <DiscordIcon className="mr-2 h-4 w-4" />
        Link Discord Account
      </a>
    </Button>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}
```

---

## Webhook Architecture

### Receive Reports from Discord

**File: `app/api/discord/webhook/route.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import nacl from 'tweetnacl'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify Discord webhook signature
async function verifyDiscordSignature(request: NextRequest): Promise<boolean> {
  const signature = (await headers()).get('x-signature-ed25519')
  const timestamp = (await headers()).get('x-signature-timestamp')
  const body = await request.text()

  if (!signature || !timestamp) return false

  const isValid = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY!, 'hex')
  )

  return isValid
}

export async function POST(request: NextRequest) {
  // For Discord Interactions endpoint (if using as bot webhook)
  // const isValid = await verifyDiscordSignature(request)
  // if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  // Simple webhook secret verification
  const webhookSecret = request.headers.get('x-webhook-secret')
  if (webhookSecret !== process.env.DISCORD_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

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
  }

  return NextResponse.json({ success: true })
}

async function handleReport(payload: {
  reporter_discord_id: string
  reported_discord_id: string
  reason: string
  message_content?: string
  message_link?: string
  channel_id?: string
}) {
  // Look up if users are linked
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

  // Create report
  await supabase.from('discord_reports').insert({
    reporter_discord_id: payload.reporter_discord_id,
    reporter_user_id: reporter?.id || null,
    reported_discord_id: payload.reported_discord_id,
    reported_user_id: reported?.id || null,
    reason: payload.reason,
    message_content: payload.message_content,
    message_link: payload.message_link,
    channel_id: payload.channel_id,
  })

  // TODO: Send notification to admin (email, Slack, etc.)
}

async function handleModAction(payload: {
  target_discord_id: string
  moderator_discord_id: string
  action_type: string
  reason?: string
}) {
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

  // Log action
  await supabase.from('moderation_actions').insert({
    target_user_id: target?.id || null,
    target_discord_id: payload.target_discord_id,
    moderator_id: moderator?.id || null,
    moderator_discord_id: payload.moderator_discord_id,
    action_type: payload.action_type,
    reason: payload.reason,
    platform: 'discord',
  })

  // If it's a ban and user is linked, ban on website too
  if (payload.action_type === 'ban' && target) {
    await supabase
      .from('profiles')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        ban_reason: payload.reason || 'Banned from Discord server',
      })
      .eq('id', target.id)
  }
}

async function handleUserJoin(payload: { discord_id: string }) {
  // Check if user is banned on website
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('discord_id', payload.discord_id)
    .single()

  if (profile?.is_banned) {
    // TODO: Kick from Discord server via API
    console.log(`Banned user ${payload.discord_id} tried to join`)
  }
}
```

### Send Actions to Discord

**File: `lib/discord/actions.ts`**

```typescript
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!

export async function banFromDiscord(discordId: string, reason?: string) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/bans/${discordId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        delete_message_seconds: 86400, // Delete last 24h of messages
        reason: reason || 'Banned from Coastal Haven Partners',
      }),
    }
  )

  return response.ok
}

export async function unbanFromDiscord(discordId: string) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/bans/${discordId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    }
  )

  return response.ok
}

export async function kickFromDiscord(discordId: string, reason?: string) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'X-Audit-Log-Reason': reason || 'Kicked from Coastal Haven Partners',
      },
    }
  )

  return response.ok
}

export async function sendModLogEmbed(embed: {
  title: string
  description: string
  color: number
  fields?: { name: string; value: string; inline?: boolean }[]
}) {
  const MOD_LOG_WEBHOOK = process.env.DISCORD_MOD_LOG_WEBHOOK!

  await fetch(MOD_LOG_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  })
}
```

---

## Admin UI Updates

### 1. User Card Discord Badge

**File: `components/admin/user-card.tsx`**

```tsx
import { Badge } from '@/components/ui/badge'
import { DiscordIcon } from '@/components/icons/discord'

interface UserCardProps {
  user: {
    id: string
    full_name: string
    email: string
    role: string
    discord_id: string | null
    discord_username: string | null
    is_banned: boolean
  }
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{user.full_name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="flex items-center gap-2">
          {user.is_banned && (
            <Badge variant="destructive">Banned</Badge>
          )}

          {user.discord_username ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DiscordIcon className="h-3 w-3" />
              {user.discord_username}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              No Discord
            </Badge>
          )}

          <Badge>{user.role}</Badge>
        </div>
      </div>
    </div>
  )
}
```

### 2. Moderation Panel

**File: `app/admin/users/[id]/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/components/admin/user-profile'
import { ModerationHistory } from '@/components/admin/moderation-history'
import { ModerationActions } from '@/components/admin/moderation-actions'

export default async function UserPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get user profile
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  // Get moderation history
  const { data: modHistory } = await supabase
    .from('moderation_actions')
    .select('*, moderator:profiles!moderator_id(full_name)')
    .or(`target_user_id.eq.${params.id},target_discord_id.eq.${user?.discord_id}`)
    .order('created_at', { ascending: false })

  // Get pending reports against this user
  const { data: reports } = await supabase
    .from('discord_reports')
    .select('*')
    .or(`reported_user_id.eq.${params.id},reported_discord_id.eq.${user?.discord_id}`)
    .eq('status', 'pending')

  return (
    <div className="space-y-6">
      <UserProfile user={user} />

      {reports && reports.length > 0 && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4">
          <h3 className="font-medium text-yellow-800">
            {reports.length} Pending Report(s)
          </h3>
          {/* Render reports */}
        </div>
      )}

      <ModerationActions user={user} />

      <ModerationHistory actions={modHistory || []} />
    </div>
  )
}
```

### 3. Moderation Actions Component

**File: `components/admin/moderation-actions.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ModerationActionsProps {
  user: {
    id: string
    discord_id: string | null
    is_banned: boolean
  }
}

export function ModerationActions({ user }: ModerationActionsProps) {
  const [reason, setReason] = useState('')
  const [syncDiscord, setSyncDiscord] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleBan() {
    setLoading(true)

    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        action: 'ban',
        reason,
        sync_discord: syncDiscord && !!user.discord_id,
      }),
    })

    setLoading(false)
    window.location.reload()
  }

  async function handleWarn() {
    setLoading(true)

    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        action: 'warn',
        reason,
        sync_discord: syncDiscord && !!user.discord_id,
      }),
    })

    setLoading(false)
    setReason('')
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 font-medium">Moderation Actions</h3>

      <div className="space-y-4">
        <Textarea
          placeholder="Reason for action..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {user.discord_id && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="sync-discord"
              checked={syncDiscord}
              onCheckedChange={(checked) => setSyncDiscord(!!checked)}
            />
            <label htmlFor="sync-discord" className="text-sm">
              Also apply to Discord
            </label>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleWarn} disabled={loading}>
            Warn
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={user.is_banned}>
                {user.is_banned ? 'Already Banned' : 'Ban User'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Ban</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                This will ban the user from the platform
                {syncDiscord && user.discord_id && ' and Discord server'}.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={handleBan} disabled={loading}>
                  Confirm Ban
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
```

### 4. Admin Moderation API

**File: `app/api/admin/moderate/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { banFromDiscord, kickFromDiscord, sendModLogEmbed } from '@/lib/discord/actions'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

  const { user_id, action, reason, sync_discord } = await request.json()

  // Get target user
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single()

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Perform action
  switch (action) {
    case 'warn':
      await supabase.from('moderation_actions').insert({
        target_user_id: user_id,
        target_discord_id: targetUser.discord_id,
        moderator_id: user.id,
        action_type: 'warn',
        reason,
        platform: sync_discord ? 'both' : 'website',
      })

      // TODO: Send DM to user via Discord bot
      break

    case 'ban':
      // Update profile
      await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_by: user.id,
          ban_reason: reason,
        })
        .eq('id', user_id)

      // Log action
      await supabase.from('moderation_actions').insert({
        target_user_id: user_id,
        target_discord_id: targetUser.discord_id,
        moderator_id: user.id,
        action_type: 'ban',
        reason,
        platform: sync_discord ? 'both' : 'website',
      })

      // Sync to Discord
      if (sync_discord && targetUser.discord_id) {
        await banFromDiscord(targetUser.discord_id, reason)
      }

      // Log to mod channel
      await sendModLogEmbed({
        title: 'User Banned',
        description: `**${targetUser.full_name}** has been banned`,
        color: 0xff0000,
        fields: [
          { name: 'Reason', value: reason || 'No reason provided' },
          { name: 'Platform', value: sync_discord ? 'Website + Discord' : 'Website only' },
        ],
      })
      break

    case 'unban':
      await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null,
        })
        .eq('id', user_id)

      if (sync_discord && targetUser.discord_id) {
        await unbanFromDiscord(targetUser.discord_id)
      }
      break
  }

  return NextResponse.json({ success: true })
}
```

---

## Moderation Workflow

### Standard Process

```
1. REPORT RECEIVED
   ├── From Discord (via bot/webhook)
   └── From Website (report button)
         │
         ▼
2. REPORT LOGGED
   ├── Stored in discord_reports table
   ├── Notification sent to mod channel
   └── Appears in Admin Panel
         │
         ▼
3. MOD REVIEW
   ├── View report in Admin Panel
   ├── See user's profile + history
   └── Check linked Discord info
         │
         ▼
4. ACTION TAKEN
   ├── Warn → DM user + log
   ├── Mute → Timeout on Discord + flag on website
   ├── Kick → Remove from Discord
   └── Ban → Ban both platforms
         │
         ▼
5. SYNC EXECUTED
   ├── Website: Update profiles table
   ├── Discord: API call (ban/kick/role)
   └── Log: moderation_actions table
         │
         ▼
6. REPORT CLOSED
   ├── Update status to 'actioned' or 'dismissed'
   └── Link to moderation_action
```

### Quick Reference: Mod Commands

| Action | Discord Command | Admin Panel | Syncs To |
|--------|-----------------|-------------|----------|
| Lookup | `/lookup @user` | Search users | N/A |
| Warn | `/warn @user [reason]` | Click "Warn" | Both |
| Mute | `/mute @user [duration]` | Coming soon | Discord only |
| Kick | `/kick @user [reason]` | Click "Kick" | Discord only |
| Ban | `/ban @user [reason]` | Click "Ban" | Both |
| History | `/history @user` | View profile | N/A |

---

## Implementation Phases

### Phase 1: Database & OAuth (Day 1-2)
- [ ] Create moderation tables migration
- [ ] Add ban fields to profiles
- [ ] Implement Discord OAuth flow
- [ ] Add "Link Discord" button to profile page
- [ ] Show Discord badge in admin user list

### Phase 2: Webhook Integration (Day 2-3)
- [ ] Create webhook endpoint
- [ ] Set up report handling
- [ ] Implement mod action logging
- [ ] Create Discord action helpers (ban, kick, etc.)

### Phase 3: Admin UI (Day 3-4)
- [ ] Add moderation panel to user detail page
- [ ] Create moderation history component
- [ ] Implement warn/ban actions with Discord sync
- [ ] Add pending reports view

### Phase 4: Discord Bot (Day 4-5)
- [ ] Set up bot project (or configure Wick)
- [ ] Implement `/lookup` command
- [ ] Implement `/warn` command
- [ ] Implement `/history` command
- [ ] Connect bot to webhook endpoint

### Phase 5: Testing & Polish (Day 5-6)
- [ ] Test full flow: Discord report → Admin action → Discord ban
- [ ] Test OAuth linking/unlinking
- [ ] Add error handling and notifications
- [ ] Document mod procedures

---

## Environment Variables Needed

```bash
# Add to apps/www/.env.local

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_GUILD_ID=your_server_id

# Webhooks
DISCORD_WEBHOOK_SECRET=random_secret_string
DISCORD_MOD_LOG_WEBHOOK=https://discord.com/api/webhooks/...
```

---

## Security Considerations

1. **Webhook Verification** - Always verify webhook signatures
2. **Rate Limiting** - Implement rate limits on moderation endpoints
3. **Audit Logs** - Log all moderation actions with timestamps
4. **Role Checks** - Double-verify admin status on all mod endpoints
5. **Discord Permissions** - Bot needs `BAN_MEMBERS`, `KICK_MEMBERS`, `MANAGE_ROLES`

---

## Next Steps

1. Apply the database migration
2. Set up Discord application at discord.com/developers
3. Decide: Custom bot vs Wick + webhook integration
4. Implement OAuth flow
5. Build admin UI components
