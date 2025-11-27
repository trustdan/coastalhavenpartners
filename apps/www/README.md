# Coastal Haven Partners - Web Application

This is the main Next.js application for Coastal Haven Partners, a finance talent network connecting candidates with recruiters and educational institutions.

## Getting Started

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Database & Auth:** Supabase (PostgreSQL)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI & Magic UI

---

## Supabase Database Schema

The complete database schema is documented in the [root README.md](../../README.md#-supabase-database-schema). This section provides a quick reference.

### Tables Overview

| Table | Purpose |
|-------|---------|
| `profiles` | Core user identity (extends auth.users) |
| `candidate_profiles` | Student academic & professional data |
| `recruiter_profiles` | Recruiter and firm information |
| `school_profiles` | University career services profiles |
| `candidate_interactions` | Recruiter-candidate engagement tracking |
| `analytics_events` | Platform usage analytics |

### User Roles

```sql
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin', 'school_admin');
```

### Key Relationships

```
auth.users (Supabase managed)
    │
    └── profiles (1:1)
            │
            ├── candidate_profiles (1:1, if role = 'candidate')
            ├── recruiter_profiles (1:1, if role = 'recruiter')
            └── school_profiles (1:1, if role = 'school_admin')
```

### Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `resumes` | Candidate resume PDFs |
| `transcripts` | Candidate transcript PDFs |
| `school-documents` | School verification documents |

**Path convention:** `{user_id}/{filename}`

### Migration Files

Located in `supabase/migrations/`. Key migrations:

| File | Description |
|------|-------------|
| `20251122000000_initial_schema.sql` | Core tables, enums, RLS |
| `20251123000200_storage_buckets.sql` | Storage buckets setup |
| `20251123191050_analytics_schema.sql` | Analytics events |
| `20251125000000_recruiter_profile_visibility.sql` | Visibility controls |
| `20251125000100_school_profiles.sql` | School admin support |
| `20251127000000_candidate_profile_visibility.sql` | Candidate privacy |
| `20251127400000_candidate_education_fields.sql` | Graduate education |

### Database Commands

```bash
# Push migrations to Supabase
pnpm supabase db push

# Generate TypeScript types from database
pnpm supabase gen types typescript --local > lib/types/database.types.ts
```

### TypeScript Types

Database types are defined in `lib/types/database.types.ts`. Key exports:

```typescript
import { Database } from '@/lib/types/database.types'

// Table row types
type Profile = Database['public']['Tables']['profiles']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type RecruiterProfile = Database['public']['Tables']['recruiter_profiles']['Row']
type SchoolProfile = Database['public']['Tables']['school_profiles']['Row']

// Enums
type UserRole = Database['public']['Enums']['user_role']
type CandidateStatus = Database['public']['Enums']['candidate_status']
type EducationLevel = Database['public']['Enums']['education_level']
```

### Querying with Foreign Keys

When tables have multiple foreign keys to the same table, use explicit constraint names:

```typescript
// Incorrect (ambiguous)
.select('*, profiles(*)')

// Correct (explicit constraint)
.select(`
  *,
  profiles!recruiter_profiles_user_id_fkey (
    full_name,
    email
  )
`)
```

Find constraint names in `lib/types/database.types.ts` under the `Relationships` array.

---

## Project Structure

```
apps/www/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (marketing)/      # Public marketing pages
│   ├── admin/            # Admin dashboard
│   ├── candidate/        # Candidate portal
│   ├── recruiter/        # Recruiter portal
│   └── school/           # School admin portal
├── components/
│   ├── magicui/          # Animated UI components
│   ├── sections/         # Landing page sections
│   └── ui/               # Shadcn/UI components
├── lib/
│   ├── supabase/         # Supabase client setup
│   └── types/            # TypeScript definitions
└── supabase/
    └── migrations/       # SQL migration files
```

---

## Discord Integration

The website integrates with Discord for community features and moderation sync. For full architecture details, see the [root README](../../README.md#-discord-integration).

### Discord API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/discord/callback` | GET | OAuth2 callback for account linking |
| `/api/discord/webhook` | POST | Receives events from Discord bot |
| `/api/admin/moderate` | POST | Admin moderation with Discord sync |

### OAuth Flow

```
User clicks "Link Discord" in Settings
         │
         ▼
Redirect to Discord OAuth2
         │
         ▼
User authorizes app
         │
         ▼
Discord redirects to /api/discord/callback
         │
         ▼
Callback validates state, exchanges code for token
         │
         ▼
Fetches Discord user info, stores discord_id in profile
         │
         ▼
Notifies bot API to assign role in Discord server
```

### Webhook Security

The `/api/discord/webhook` endpoint requires a secret header:

```typescript
// Request must include:
headers: {
  'x-webhook-secret': process.env.DISCORD_WEBHOOK_SECRET
}
```

### Environment Variables (Discord-specific)

Add these to `.env.local`:

```bash
# Discord OAuth (from Discord Developer Portal → OAuth2)
DISCORD_CLIENT_ID=your_application_client_id
DISCORD_CLIENT_SECRET=your_application_client_secret

# Bot Communication
DISCORD_BOT_API_URL=https://your-bot.railway.app
DISCORD_BOT_API_SECRET=shared_secret_with_bot

# Webhook Security (generate a random string, share with bot)
DISCORD_WEBHOOK_SECRET=your_webhook_secret
```

### Database Tables (Discord-related)

Located in `supabase/migrations/`:

| Migration | Tables |
|-----------|--------|
| `20251127500000_discord_moderation.sql` | `moderation_actions`, `discord_reports` |

Key fields added to `profiles`:
- `discord_id` - Discord user ID
- `discord_username` - Current username
- `discord_verified_at` - When linked
- `is_banned`, `banned_at`, `banned_by`, `ban_reason` - Ban status

### Moderation Actions API

```typescript
// POST /api/admin/moderate
{
  user_id: string,           // Target user's profile ID
  action: 'warn' | 'mute' | 'kick' | 'ban' | 'unban',
  reason?: string,
  sync_discord?: boolean,    // Also apply in Discord
  duration_minutes?: number  // For mutes
}
```

### Testing Discord Integration

1. **Link Account**: Go to `/dashboard/settings` and click "Link Discord"
2. **Verify Role**: Check that bot assigns correct role in Discord
3. **Test Ban Sync**: Ban a user in Discord, verify `is_banned` updates in database
4. **Test Admin Moderation**: Use admin panel to ban with `sync_discord: true`

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Magic UI](https://magicui.design/)
