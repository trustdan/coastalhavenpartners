# Discord Bot Setup Guide

This guide walks you through setting up the Coastal Haven Partners Discord community integration.

## Overview

The integration consists of:
1. **Discord Bot** (this package) - Hosted on Railway, manages roles and responds to commands
2. **Next.js API Routes** - Handle OAuth flow, hosted on Vercel with your main site
3. **Supabase** - Stores Discord linking info in the `profiles` table

## Prerequisites

- Discord account with a server you own/admin
- Railway account (free tier works)
- Your Supabase and Vercel already set up

---

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Name it "Coastal Haven Partners"
3. Note down the **Application ID** (this is your `DISCORD_CLIENT_ID`)

### Configure OAuth2

4. Go to **OAuth2 → General**
5. Add redirect URL: `https://coastalhavenpartners.com/api/discord/callback`
   - Also add `http://localhost:3000/api/discord/callback` for local testing
6. Copy the **Client Secret** (this is your `DISCORD_CLIENT_SECRET`)

### Create Bot

7. Go to **Bot** section
8. Click **"Add Bot"**
9. Under **Privileged Gateway Intents**, enable:
   - **Server Members Intent** (required for role assignment)
10. Click **"Reset Token"** and copy it (this is your `DISCORD_BOT_TOKEN`)

### Generate Invite URL

11. Go to **OAuth2 → URL Generator**
12. Select scopes: `bot`, `applications.commands`
13. Select permissions:
    - Manage Roles
    - Send Messages
    - Use Slash Commands
14. Copy the generated URL and use it to invite the bot to your server

---

## Step 2: Set Up Discord Server

### Create Roles

Create these roles in your Discord server (Server Settings → Roles):

| Role Name | Color | Purpose |
|-----------|-------|---------|
| `Unverified` | Gray | New members before linking |
| `Candidate` | Blue | Verified student accounts |
| `Recruiter` | Gold | Verified recruiter accounts |
| `Admin` | Red | Site administrators |

**Important:** Make sure the bot's role is **above** these roles in the hierarchy.

### Get Role IDs

1. Enable Developer Mode: User Settings → Advanced → Developer Mode
2. Right-click each role → "Copy ID"
3. Save these as your `DISCORD_*_ROLE_ID` values

### Get Server ID

Right-click your server name → "Copy Server ID" → This is your `DISCORD_GUILD_ID`

### Create Channel Structure (Recommended)

```
📢 INFORMATION
├── #welcome (read-only, rules & verify instructions)
├── #announcements (read-only)
└── #roles (reaction roles if desired)

💬 COMMUNITY (requires Candidate/Recruiter role)
├── #introductions
├── #general
└── #off-topic

🎓 STUDENTS (Candidate role only)
├── #resume-review
├── #interview-prep
└── #networking

💼 RECRUITERS (Recruiter role only)
├── #recruiter-lounge
└── #job-postings
```

Set channel permissions so `@everyone` can only see #welcome, and verified roles can see the rest.

---

## Step 3: Deploy Bot to Railway

### Create Railway Project

1. Go to [Railway](https://railway.app) and create new project
2. Choose **"Deploy from GitHub repo"**
3. Connect your repo and select the `apps/discord-bot` directory

### Configure Railway

4. In Railway dashboard, go to **Settings**:
   - Root Directory: `apps/discord-bot`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

5. Add environment variables (Settings → Variables):

```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_server_id

DISCORD_UNVERIFIED_ROLE_ID=...
DISCORD_CANDIDATE_ROLE_ID=...
DISCORD_RECRUITER_ROLE_ID=...
DISCORD_ADMIN_ROLE_ID=...

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

BOT_API_SECRET=generate_a_32_char_random_string

WEBSITE_URL=https://coastalhavenpartners.com
```

6. Deploy! Railway will assign a URL like `https://your-bot.up.railway.app`

---

## Step 4: Configure Vercel (Website)

Add these environment variables to your Vercel project:

```env
# Discord OAuth (same as bot)
DISCORD_CLIENT_ID=your_application_id
DISCORD_CLIENT_SECRET=your_client_secret

# Bot API connection
DISCORD_BOT_API_URL=https://your-bot.up.railway.app
DISCORD_BOT_API_SECRET=same_secret_as_bot
```

---

## Step 5: Run Database Migration

```bash
cd apps/www
pnpm supabase db push
```

Or apply manually:

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS discord_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS discord_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON public.profiles(discord_id);
```

---

## Step 6: Add UI to Settings Page

Add a Discord connection section to your settings page. Example component:

```tsx
// components/discord-connect.tsx
'use client'

import { Button } from '@/components/ui/button'

export function DiscordConnect({
  isConnected,
  username
}: {
  isConnected: boolean
  username?: string
}) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span>Connected as {username}</span>
        <Button
          variant="outline"
          onClick={async () => {
            await fetch('/api/discord/unlink', { method: 'POST' })
            window.location.reload()
          }}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button asChild>
      <a href="/api/discord/auth">Connect Discord</a>
    </Button>
  )
}
```

---

## Testing

### Local Development

1. Create `apps/discord-bot/.env` with your variables
2. Run the bot locally:
   ```bash
   cd apps/discord-bot
   pnpm install
   pnpm dev
   ```
3. Use ngrok to expose local bot API for testing:
   ```bash
   ngrok http 3001
   ```
4. Update `DISCORD_BOT_API_URL` in your local Next.js `.env.local`

### Verify Integration

1. Join your Discord server with a test account
2. Check that you receive the welcome DM
3. Go to your website settings and click "Connect Discord"
4. Verify the OAuth flow completes
5. Check that your role was assigned in Discord

---

## Troubleshooting

### Bot not responding to slash commands
- Check bot has proper permissions in the channel
- Try kicking and re-inviting the bot
- Check Railway logs for errors

### Role assignment failing
- Ensure bot's role is higher than the roles it assigns
- Verify role IDs are correct
- Check `BOT_API_SECRET` matches on both sides

### OAuth flow failing
- Verify redirect URLs in Discord Developer Portal
- Check `DISCORD_CLIENT_SECRET` is correct
- Look at Vercel function logs

---

## Cost Breakdown

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Railway | $5 credit/month | ~$3-5/month |
| Vercel | Generous free tier | Likely $0 |
| Discord | Free | Free |

**Estimated total: $0-5/month**
