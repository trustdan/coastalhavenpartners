# Coastal Haven Partners

Coastal Haven Partners is a comprehensive recruitment platform connecting top-tier candidates with specialized recruiters and educational institutions. The platform facilitates the entire recruitment lifecycle, from profile creation and verification to candidate discovery and placement.

## 🚀 Project Overview

The application serves four distinct user roles, each with a tailored portal:

- **Candidates:** Create profiles, upload resumes/transcripts, manage preferences, and view interested recruiters.
- **Recruiters:** Build firm profiles, search and filter verified candidates, and manage candidate pipelines.
- **Schools:** Verify student profiles, track alumni placement, and manage university branding.
- **Admins:** Oversee platform activity, approve recruiter accounts, and manage global settings.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/) & [Magic UI](https://magicui.design/)
- **Deployment:** Vercel

## ✨ Key Features

### Candidate Portal
- **Profile Management:** Detailed academic and professional profiles.
- **Document Upload:** Secure resume and transcript storage.
- **Verification Status:** Visual indicators for verified academic status.

### Recruiter Portal
- **Advanced Search:** Filter candidates by GPA, major, school, and more.
- **Network:** Connect with other recruiters in the ecosystem.
- **Visibility Control:** Granular settings to control what information is visible to candidates vs. other recruiters.

### School Portal
- **Student Verification:** Tools to verify student claims and documents.
- **Analytics:** Insights into student performance and placement.

### Admin Dashboard
- **Recruiter Approval:** Workflow to vet and approve new recruiter accounts.
- **User Management:** Global controls for all user types.

---

## 🤖 Discord Integration

The platform integrates deeply with Discord to provide community features and synchronized moderation. This section documents the complete Discord architecture.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DISCORD SERVER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │ Custom Bot  │  │   YAGPDB    │  │  AutoMod    │  │ Community Settings│  │
│  │ (Railway)   │  │  (3rd party)│  │  (Native)   │  │    (Native)       │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └───────────────────┘  │
└─────────┼────────────────┼──────────────────────────────────────────────────┘
          │                │
          │ Webhooks       │ Mod Logs
          ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WEBSITE (Vercel)                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ /api/discord/       │  │ /api/discord/       │  │ /api/admin/         │  │
│  │    callback         │  │    webhook          │  │    moderate         │  │
│  │ (OAuth linking)     │  │ (Receive events)    │  │ (Admin actions)     │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                      │                        │              │
│                                      ▼                        ▼              │
│                           ┌─────────────────────────────────────────────┐   │
│                           │              SUPABASE                        │   │
│                           │  ┌─────────────┐  ┌───────────────────────┐ │   │
│                           │  │  profiles   │  │  moderation_actions   │ │   │
│                           │  │ (discord_id)│  │  discord_reports      │ │   │
│                           │  └─────────────┘  └───────────────────────┘ │   │
│                           └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Custom Discord Bot (`apps/discord-bot`)

A Node.js bot deployed on Railway that handles:

| Feature | Description |
|---------|-------------|
| **Account Linking** | `/verify` command directs users to OAuth flow |
| **Role Assignment** | Assigns roles based on user type (candidate, recruiter, etc.) |
| **Moderation Sync** | Listens for ban/unban/kick events and syncs to website |
| **Welcome Messages** | DMs new members with verification instructions |

**Key Events Monitored:**
- `GuildBanAdd` - User banned from Discord → Ban on website
- `GuildBanRemove` - User unbanned from Discord → Unban on website
- `GuildMemberRemove` - Detects kicks vs. voluntary leaves

**Deployment:** Railway (auto-deploys from `apps/discord-bot/`)

#### 2. Website Webhook Endpoint (`/api/discord/webhook`)

Receives events from:
- Custom bot (ban/unban/kick/leave events)
- YAGPDB moderation logs (optional)

**Payload Types:**
```typescript
type WebhookPayload =
  | { type: 'REPORT', reporter_discord_id, reported_discord_id, reason, ... }
  | { type: 'MOD_ACTION', target_discord_id, action_type, reason, ... }
  | { type: 'USER_JOIN', discord_id }
  | { type: 'USER_LEAVE', discord_id, reason }
  | { type: 'BAN_ADD', discord_id, moderator_discord_id?, reason? }
  | { type: 'BAN_REMOVE', discord_id, moderator_discord_id? }
```

#### 3. Admin Moderation API (`/api/admin/moderate`)

Allows website admins to moderate users with optional Discord sync:

```typescript
POST /api/admin/moderate
{
  user_id: string,
  action: 'warn' | 'mute' | 'kick' | 'ban' | 'unban',
  reason?: string,
  sync_discord?: boolean,  // Also apply action in Discord
  duration_minutes?: number  // For mutes
}
```

#### 4. Discord OAuth Callback (`/api/discord/callback`)

Handles the OAuth2 flow for linking Discord accounts:
1. User initiates from Settings page
2. Redirected to Discord OAuth
3. Callback validates and stores `discord_id` in profile
4. Notifies bot to assign appropriate role

### Third-Party Bots

#### YAGPDB (Yet Another General Purpose Discord Bot)

Used for advanced moderation logging and automation:

| Feature | Usage |
|---------|-------|
| **Mod Logs** | Sends moderation events to a log channel |
| **Custom Commands** | Server-specific automation |
| **Auto-moderation** | Spam/raid protection beyond native AutoMod |

**Setup:** Configure YAGPDB to send webhook notifications to `/api/discord/webhook` for mod actions.

### Native Discord Features

#### AutoMod (Discord's Built-in)

Configure in **Server Settings → Safety Setup → AutoMod**:
- Block harmful links
- Block spam content
- Block mention spam
- Custom keyword filters

#### Community Settings

Enable in **Server Settings → Community**:
- Membership screening (rules agreement)
- Welcome screen
- Server insights
- Discovery eligibility

### Database Schema (Discord-related)

#### `profiles` table additions:

| Column | Type | Description |
|--------|------|-------------|
| `discord_id` | TEXT | Discord user ID |
| `discord_username` | TEXT | Current Discord username |
| `discord_verified_at` | TIMESTAMPTZ | When account was linked |
| `is_banned` | BOOLEAN | Website ban status (syncs with Discord) |
| `banned_at` | TIMESTAMPTZ | When user was banned |
| `banned_by` | UUID | Admin who issued ban |
| `ban_reason` | TEXT | Reason for ban |
| `ban_expires_at` | TIMESTAMPTZ | For temporary bans |

#### `moderation_actions` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `target_user_id` | UUID | FK to profiles (if linked) |
| `target_discord_id` | TEXT | Discord ID (even if not linked) |
| `moderator_id` | UUID | FK to profiles |
| `moderator_discord_id` | TEXT | Discord ID of moderator |
| `action_type` | TEXT | warn, mute, kick, ban, unban |
| `reason` | TEXT | Reason for action |
| `platform` | TEXT | 'website' or 'discord' |
| `expires_at` | TIMESTAMPTZ | For temporary actions |
| `is_active` | BOOLEAN | Current status |

#### `discord_reports` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `reporter_discord_id` | TEXT | Who filed the report |
| `reported_discord_id` | TEXT | Who was reported |
| `reason` | TEXT | Report reason |
| `message_content` | TEXT | Reported message (optional) |
| `message_link` | TEXT | Link to message |
| `status` | TEXT | pending, reviewed, resolved, dismissed |
| `reviewed_by` | UUID | Admin who reviewed |

### Environment Variables

#### Website (`apps/www/.env.local`)

```bash
# Discord OAuth (from Discord Developer Portal)
DISCORD_CLIENT_ID=your_application_client_id
DISCORD_CLIENT_SECRET=your_application_client_secret

# Bot API Communication
DISCORD_BOT_API_URL=https://your-bot.railway.app
DISCORD_BOT_API_SECRET=shared_secret_with_bot

# Webhook Security
DISCORD_WEBHOOK_SECRET=your_webhook_secret
```

#### Discord Bot (`apps/discord-bot/.env`)

```bash
# Discord Bot (from Discord Developer Portal → Bot section)
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_client_id
DISCORD_GUILD_ID=your_server_id

# Role IDs (from Discord → Server Settings → Roles → right-click → Copy ID)
DISCORD_UNVERIFIED_ROLE_ID=
DISCORD_CANDIDATE_ROLE_ID=
DISCORD_RECRUITER_ROLE_ID=
DISCORD_CAREER_SERVICES_ROLE_ID=
DISCORD_ADMIN_ROLE_ID=

# Supabase (service role for admin access)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Security
BOT_API_SECRET=shared_secret_with_website

# Website Webhook
WEBSITE_WEBHOOK_URL=https://coastalhavenpartners.com/api/discord/webhook
WEBSITE_WEBHOOK_SECRET=your_webhook_secret

# Railway sets this automatically
PORT=3001
```

### Railway Deployment

The Discord bot is deployed on Railway for 24/7 uptime.

**Setup Steps:**
1. Create new project in Railway
2. Connect GitHub repository
3. Set Root Directory to `apps/discord-bot`
4. Set Watch Paths to `apps/discord-bot/**`
5. Add all environment variables
6. Deploy

**Monitoring:**
- View logs in Railway dashboard
- Health check endpoint: `GET /health`
- Bot status visible in Discord (online indicator)

### Discord Server Setup Checklist

1. **Create Roles** (in order of hierarchy):
   - `@Admin` - Full permissions
   - `@Career Services` - School admin access
   - `@Recruiter` - Verified recruiter
   - `@Candidate` - Verified candidate
   - `@Unverified` - New members, limited access

2. **Bot Permissions** (when inviting):
   - Manage Roles
   - Kick Members
   - Ban Members
   - View Audit Log
   - Send Messages
   - Read Message History

3. **Channel Structure** (recommended):
   ```
   📢 INFORMATION
   ├── #welcome
   ├── #rules
   └── #announcements

   💬 GENERAL
   ├── #general-chat
   └── #introductions

   🎯 CANDIDATES
   ├── #candidate-lounge
   └── #job-hunting-tips

   🏢 RECRUITERS
   ├── #recruiter-lounge
   └── #hiring-discussions

   🛡️ MODERATION (staff only)
   ├── #mod-logs
   └── #mod-discussion
   ```

4. **Enable Developer Mode** (to get IDs):
   - User Settings → Advanced → Developer Mode
   - Right-click roles/channels/users → Copy ID

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd coastalhavenpartners
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up Environment Variables:
   Create a `.env.local` file in `apps/www` with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

## 🚨 Troubleshooting & Common Issues

This section documents common pitfalls encountered during development, particularly related to the Supabase and TypeScript integration.

### 1. Ambiguous Foreign Key Joins

**Issue:**
When querying tables that have multiple foreign key relationships to the same table (e.g., `recruiter_profiles` has both `user_id` and `approved_by` pointing to `profiles`), Supabase clients cannot automatically determine which relationship to use for a join.

**Error Message:**
`SelectQueryError<"Could not embed because more than one relationship was found for 'profiles' and 'recruiter_profiles' you need to hint the column with profiles!<columnName> ?">`

**Solution:**
You **MUST** use the explicit foreign key constraint name in your query hint. Do not just use the table name or column name as the alias if it's ambiguous.

**Incorrect:**
```typescript
.select('*, profiles(*)') // Ambiguous
.select('*, profiles:user_id(*)') // Often interpreted as relation name, not column
```

**Correct:**
Find the constraint name in `database.types.ts` (e.g., `recruiter_profiles_user_id_fkey`) and use the `!constraint_name` syntax:

```typescript
.select(`
  *,
  profiles!recruiter_profiles_user_id_fkey (
    full_name,
    email
  )
`)
```

### 2. Database Type Mismatches

**Issue:**
The local TypeScript types (`database.types.ts`) falling out of sync with the actual Supabase database schema (e.g., after running a migration). This causes TypeScript errors like `Property 'school_profiles' does not exist on type...`.

**Solution:**
1.  **Check Migrations:** Ensure your SQL migration files in `supabase/migrations` are applied.
2.  **Update Types:** Manually update `apps/www/lib/types/database.types.ts` to reflect the new schema.
    -   Add new tables to the `Tables` definition.
    -   Update `Row`, `Insert`, and `Update` definitions for modified tables.
    -   Ensure `Relationships` array is accurate (this is crucial for identifying foreign key names for the issue above).

### 3. RLS (Row Level Security) Policies

**Issue:**
Queries return empty arrays `[]` or `null` unexpectedly, even when data exists.

**Solution:**
This is almost always due to RLS policies.
-   Check `supabase/migrations` to see `CREATE POLICY` statements.
-   Ensure the user has the correct `role` (candidate, recruiter, etc.) in the `profiles` table.
-   Debug by temporarily disabling RLS on the table to confirm it's a permission issue, then re-enable and fix the policy.

### 4. JSON Column Typing

**Issue:**
TypeScript errors when accessing properties of a JSONB column (e.g., `visible_fields_to_candidates`).
`Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Json'.`

**Solution:**
Cast the JSON field to a specific type before accessing dynamic properties:

```typescript
const visibility = recruiter.visible_fields_to_candidates as Record<string, boolean> | null
if (visibility?.['email']) { ... }
```

---

## 📊 Supabase Database Schema

This section documents the complete Supabase database structure for rebuilding from scratch.

### Database Overview

The platform uses PostgreSQL via Supabase with the following core tables:

| Table | Purpose |
|-------|---------|
| `profiles` | Core user identity (extends Supabase auth.users) |
| `candidate_profiles` | Student/candidate academic and professional data |
| `recruiter_profiles` | Recruiter and firm information |
| `school_profiles` | University career services admin profiles |
| `candidate_interactions` | Tracks recruiter-candidate engagement |
| `analytics_events` | Platform usage analytics |

### Enums

Create these custom types before creating tables:

```sql
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin', 'school_admin');
CREATE TYPE candidate_status AS ENUM ('pending_verification', 'verified', 'active', 'placed', 'rejected');
CREATE TYPE education_level AS ENUM ('bachelors', 'masters', 'mba', 'phd');
CREATE TYPE school_verification_status AS ENUM ('pending_documents', 'documents_submitted', 'under_review', 'approved', 'rejected');
```

### Entity Relationship Diagram

```
┌─────────────────────┐
│   auth.users        │  (Supabase managed)
│   - id (PK)         │
│   - email           │
└──────────┬──────────┘
           │ 1:1
           ▼
┌─────────────────────┐
│   profiles          │  (Core user identity)
│   - id (PK/FK)      │◄──────────────────────────────────────────────────┐
│   - email           │                                                    │
│   - role            │                                                    │
│   - full_name       │                                                    │
└──────────┬──────────┘                                                    │
           │                                                               │
    ┌──────┴──────┬─────────────────┐                                      │
    │ 1:1         │ 1:1             │ 1:1                                  │
    ▼             ▼                 ▼                                      │
┌───────────────┐ ┌─────────────────┐ ┌─────────────────┐                  │
│candidate_     │ │recruiter_       │ │school_          │                  │
│profiles       │ │profiles         │ │profiles         │                  │
│- id (PK)      │ │- id (PK)        │ │- id (PK)        │                  │
│- user_id (FK) │ │- user_id (FK)   │ │- user_id (FK)   │                  │
│- school_name  │ │- firm_name      │ │- school_name    │                  │
│- gpa          │ │- is_approved    │ │- is_approved    │                  │
│- major        │ │- approved_by ───┼─┼──────────────────┘  (FK to profiles)
│- rejected_by ─┼─┼──────────────────┘ │- approved_by ───► profiles
└───────┬───────┘ └────────┬────────┘ │- rejected_by ───► profiles
        │                  │          └─────────────────┘
        │                  │
        └───────┬──────────┘
                │ M:N
                ▼
┌─────────────────────────┐
│  candidate_interactions │
│  - id (PK)              │
│  - candidate_id (FK)    │
│  - recruiter_id (FK)    │
│  - interaction_type     │
└─────────────────────────┘

┌─────────────────────────┐
│  analytics_events       │  (Standalone)
│  - id (PK)              │
│  - event_type           │
│  - user_id              │
│  - target_id            │
│  - metadata (JSONB)     │
└─────────────────────────┘
```

### Table Definitions

#### 1. `profiles` - Core User Identity

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users(id) | Matches Supabase auth user ID |
| `email` | TEXT | UNIQUE, NOT NULL | User email |
| `role` | user_role | NOT NULL, DEFAULT 'candidate' | User type |
| `full_name` | TEXT | NOT NULL | Display name |
| `phone` | TEXT | | Phone number |
| `linkedin_url` | TEXT | | LinkedIn profile URL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated via trigger |

#### 2. `candidate_profiles` - Student/Candidate Data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `user_id` | UUID | UNIQUE, FK → profiles(id) | Links to user |
| **Undergrad Education** ||||
| `school_name` | TEXT | NOT NULL | University name |
| `graduation_year` | INTEGER | NOT NULL | Expected/actual graduation |
| `major` | TEXT | NOT NULL | Primary major |
| `gpa` | DECIMAL(3,2) | NOT NULL, CHECK 0-4.0 | Undergrad GPA |
| `education_level` | education_level | DEFAULT 'bachelors' | Highest education level |
| `undergrad_degree_type` | TEXT | | BA, BS, etc. |
| `undergrad_specialty` | TEXT | | Concentration/minor |
| **Graduate Education** ||||
| `grad_school` | TEXT | | Graduate school name |
| `grad_degree_type` | TEXT | | MA, MBA, JD, PhD, etc. |
| `grad_major` | TEXT | | Graduate field of study |
| `grad_gpa` | NUMERIC(3,2) | CHECK 0-4.0 | Graduate GPA |
| `grad_graduation_year` | INTEGER | CHECK 1950-2050 | |
| `grad_specialty` | TEXT | | Graduate concentration |
| **Professional** ||||
| `resume_url` | TEXT | | Path in storage bucket |
| `transcript_url` | TEXT | | Path in storage bucket |
| `target_roles` | TEXT[] | | e.g., ['IB', 'PE', 'VC'] |
| `preferred_locations` | TEXT[] | | e.g., ['NYC', 'SF'] |
| `bio` | TEXT | | Personal bio/summary |
| `scheduling_url` | TEXT | | Calendly/booking link |
| **Verification** ||||
| `status` | candidate_status | DEFAULT 'pending_verification' | |
| `email_verified` | BOOLEAN | DEFAULT FALSE | |
| `gpa_verified` | BOOLEAN | DEFAULT FALSE | |
| `school_verified` | BOOLEAN | DEFAULT FALSE | |
| **Rejection** ||||
| `is_rejected` | BOOLEAN | DEFAULT FALSE | |
| `rejected_at` | TIMESTAMPTZ | | |
| `rejected_by` | UUID | FK → profiles(id) | Admin who rejected |
| **Visibility Controls** ||||
| `visible_fields_to_recruiters` | JSONB | DEFAULT (see below) | Field-level privacy |
| `visible_fields_to_schools` | JSONB | DEFAULT (see below) | Field-level privacy |
| **Metadata** ||||
| `notes` | TEXT | | Internal recruiter notes |
| `tags` | TEXT[] | | Searchable tags |
| `last_activity_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | | |
| `updated_at` | TIMESTAMPTZ | | |

**Default visibility for recruiters:**
```json
{
  "linkedin_url": true,
  "email": false,
  "resume": true,
  "transcript": false
}
```

**Default visibility for schools:**
```json
{
  "linkedin_url": true,
  "email": true,
  "resume": true,
  "transcript": true
}
```

#### 3. `recruiter_profiles` - Recruiter/Firm Data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `user_id` | UUID | UNIQUE, FK → profiles(id) | |
| **Firm Details** ||||
| `firm_name` | TEXT | NOT NULL | Company name |
| `firm_type` | TEXT | | 'Investment Bank', 'PE', 'VC', etc. |
| `job_title` | TEXT | NOT NULL | Recruiter's title |
| `bio` | TEXT | | About the recruiter |
| `specialties` | TEXT[] | | e.g., ['IB', 'Trading'] |
| `locations` | TEXT[] | | Office locations |
| `years_experience` | INTEGER | | |
| `linkedin_url` | TEXT | | |
| `company_website` | TEXT | | |
| `profile_photo_url` | TEXT | | |
| **Approval** ||||
| `is_approved` | BOOLEAN | DEFAULT FALSE | Admin approval status |
| `approved_at` | TIMESTAMPTZ | | |
| `approved_by` | UUID | FK → profiles(id) | Admin who approved |
| **Rejection** ||||
| `is_rejected` | BOOLEAN | DEFAULT FALSE | |
| `rejected_at` | TIMESTAMPTZ | | |
| `rejected_by` | UUID | FK → profiles(id) | |
| **Visibility Toggles** ||||
| `is_visible_to_candidates` | BOOLEAN | DEFAULT FALSE | Master toggle |
| `is_visible_to_recruiters` | BOOLEAN | DEFAULT FALSE | Master toggle |
| `is_visible_to_schools` | BOOLEAN | DEFAULT FALSE | Master toggle |
| **Field-Level Visibility** ||||
| `visible_fields_to_candidates` | JSONB | DEFAULT (see below) | |
| `visible_fields_to_recruiters` | JSONB | DEFAULT (see below) | |
| `visible_fields_to_schools` | JSONB | DEFAULT (see below) | |
| **Metadata** ||||
| `created_at` | TIMESTAMPTZ | | |
| `updated_at` | TIMESTAMPTZ | | |

**Default visibility config structure:**
```json
{
  "full_name": true,
  "email": false,
  "phone": false,
  "firm_name": true,
  "firm_type": true,
  "job_title": true,
  "bio": true,
  "specialties": true,
  "locations": true,
  "linkedin_url": false,
  "years_experience": true,
  "company_website": true,
  "profile_photo_url": true
}
```

#### 4. `school_profiles` - Career Services Admin Data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `user_id` | UUID | UNIQUE, FK → profiles(id) | |
| **School Details** ||||
| `school_name` | TEXT | NOT NULL | University name |
| `school_domain` | TEXT | | e.g., 'harvard.edu' for verification |
| `department_name` | TEXT | DEFAULT 'Career Services' | |
| `contact_email` | TEXT | | |
| `contact_phone` | TEXT | | |
| `website` | TEXT | | |
| **Verification** ||||
| `verification_document_url` | TEXT | | Path to uploaded doc |
| `verification_document_type` | TEXT | | employment_letter, staff_id, etc. |
| `verification_notes` | TEXT | | Admin review notes |
| `verification_status` | TEXT | DEFAULT 'pending_documents' | |
| **Approval** ||||
| `is_approved` | BOOLEAN | DEFAULT FALSE | |
| `approved_at` | TIMESTAMPTZ | | |
| `approved_by` | UUID | FK → profiles(id) | |
| **Rejection** ||||
| `is_rejected` | BOOLEAN | DEFAULT FALSE | |
| `rejected_at` | TIMESTAMPTZ | | |
| `rejected_by` | UUID | FK → profiles(id) | |
| **Metadata** ||||
| `created_at` | TIMESTAMPTZ | | |
| `updated_at` | TIMESTAMPTZ | | |

#### 5. `candidate_interactions` - Engagement Tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `candidate_id` | UUID | FK → candidate_profiles(id) | |
| `recruiter_id` | UUID | FK → recruiter_profiles(id) | |
| `interaction_type` | TEXT | NOT NULL | 'viewed', 'contacted', 'interviewed', 'offered' |
| `notes` | TEXT | | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

#### 6. `analytics_events` - Usage Analytics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `event_type` | TEXT | NOT NULL | 'profile_view', 'login', 'search', etc. |
| `user_id` | UUID | FK → auth.users(id) | Who performed action |
| `target_id` | UUID | | Target of action (e.g., viewed candidate) |
| `metadata` | JSONB | DEFAULT '{}' | Additional data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

### Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `resumes` | Yes | Candidate resume PDFs |
| `transcripts` | Yes | Candidate transcript PDFs |
| `school-documents` | Yes | School verification documents |

**File path convention:** `{user_id}/{filename}`

### Database Functions

| Function | Purpose |
|----------|---------|
| `handle_new_user()` | Trigger: auto-creates profile on auth.users insert |
| `update_updated_at_column()` | Trigger: auto-updates `updated_at` timestamps |
| `is_admin()` | Returns TRUE if current user has admin role |
| `current_user_role()` | Returns the role of the current user |
| `create_candidate_profile(...)` | Creates candidate profile (bypasses RLS for signup) |
| `get_school_candidates(school_admin_id)` | Returns all candidates from a school admin's school |
| `get_visible_recruiter_fields(recruiter_id, viewer_role)` | Returns filtered recruiter profile based on visibility settings |
| `get_visible_candidate_fields(candidate_id, viewer_role)` | Returns filtered candidate profile based on visibility settings |

### Row Level Security (RLS) Summary

All tables have RLS enabled. Key policies:

**profiles:**
- Users can view/update their own profile
- Admins can view all profiles

**candidate_profiles:**
- Candidates can view/update their own profile
- Approved recruiters can view verified candidates
- School admins can view candidates from their school

**recruiter_profiles:**
- Recruiters can view/update their own profile
- Candidates can view approved recruiters with `is_visible_to_candidates = TRUE`
- Other recruiters can view approved recruiters with `is_visible_to_recruiters = TRUE`
- School admins can view approved recruiters with `is_visible_to_schools = TRUE`

**school_profiles:**
- School admins can view/update their own profile
- Admins can view all school profiles

**analytics_events:**
- Authenticated users can insert events
- Admins can view all events
- Candidates can view events targeting them
- Recruiters can view their own events
- School admins can view events for their students

### Indexes

```sql
-- Candidate Profiles
CREATE INDEX idx_candidate_status ON candidate_profiles(status);
CREATE INDEX idx_candidate_gpa ON candidate_profiles(gpa);
CREATE INDEX idx_candidate_graduation_year ON candidate_profiles(graduation_year);

-- Recruiter Profiles
CREATE INDEX idx_recruiter_approved ON recruiter_profiles(is_approved);
CREATE INDEX idx_recruiter_visible_to_candidates ON recruiter_profiles(is_visible_to_candidates) WHERE is_visible_to_candidates = TRUE;
CREATE INDEX idx_recruiter_visible_to_recruiters ON recruiter_profiles(is_visible_to_recruiters) WHERE is_visible_to_recruiters = TRUE;
CREATE INDEX idx_recruiter_visible_to_schools ON recruiter_profiles(is_visible_to_schools) WHERE is_visible_to_schools = TRUE;
CREATE INDEX idx_recruiter_specialties ON recruiter_profiles USING GIN(specialties);
CREATE INDEX idx_recruiter_locations ON recruiter_profiles USING GIN(locations);

-- School Profiles
CREATE INDEX idx_school_profiles_school_name ON school_profiles(school_name);
CREATE INDEX idx_school_profiles_approved ON school_profiles(is_approved) WHERE is_approved = TRUE;

-- Analytics
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_target_id ON analytics_events(target_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
```

### Rebuilding the Database

To rebuild the database from scratch:

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Apply migrations in order:**
   ```bash
   cd apps/www
   pnpm supabase db push
   ```

3. **Or apply manually via SQL Editor:**
   - Run each migration file in `apps/www/supabase/migrations/` in chronological order (by filename date prefix)

4. **Create storage buckets:**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES
     ('resumes', 'resumes', true),
     ('transcripts', 'transcripts', true),
     ('school-documents', 'school-documents', true);
   ```

5. **Regenerate TypeScript types:**
   ```bash
   pnpm supabase gen types typescript --local > apps/www/lib/types/database.types.ts
   ```

6. **Update environment variables** in `apps/www/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_new_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
   ```

### Migration Files Reference

Located in `apps/www/supabase/migrations/`:

| File | Description |
|------|-------------|
| `20251122000000_initial_schema.sql` | Core tables, enums, RLS, triggers |
| `20251122000001_add_insert_policies.sql` | INSERT policies for signup |
| `20251123000100_fix_profile_role.sql` | Profile role handling fixes |
| `20251123000200_storage_buckets.sql` | Resume/transcript storage |
| `20251123000300_admin_policies.sql` | Admin access policies |
| `20251123191050_analytics_schema.sql` | Analytics events table |
| `20251123205500_harden_handle_new_user.sql` | Hardened signup trigger |
| `20251124000000_fix_circular_rls.sql` | RLS recursion fixes |
| `20251124000100_fix_admin_function.sql` | Admin function improvements |
| `20251125000000_recruiter_profile_visibility.sql` | Recruiter visibility controls |
| `20251125000100_school_profiles.sql` | School admin profiles |
| `20251125000200_candidate_signup_function.sql` | Candidate signup helper |
| `20251125000300_recruiter_rejection.sql` | Recruiter rejection fields |
| `20251125000400_school_verification_docs.sql` | School verification docs |
| `20251125000500_school_documents_bucket.sql` | School docs storage |
| `20251125000600_make_school_docs_public.sql` | Public school docs access |
| `20251125000700_school_rejection.sql` | School rejection fields |
| `20251125000800_candidate_rejection.sql` | Candidate rejection fields |
| `20251125001000_fix_recruiter_rls_recursion.sql` | More RLS fixes |
| `20251127000000_candidate_profile_visibility.sql` | Candidate visibility controls |
| `20251127100000_recruiter_view_candidate_profiles.sql` | Recruiter candidate access |
| `20251127200000_candidate_scheduling_url.sql` | Scheduling URL field |
| `20251127300000_candidate_bio_field.sql` | Candidate bio field |
| `20251127400000_candidate_education_fields.sql` | Graduate education fields |
