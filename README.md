# Coastal Haven Partners

A comprehensive finance talent network connecting top-tier candidates with elite recruiters and educational institutions.

## Project Overview

Coastal Haven Partners is a two-sided marketplace that facilitates the entire recruitment lifecycle for finance roles. The platform serves four distinct user types:

| Role | Description |
|------|-------------|
| **Candidates** | Students and professionals seeking finance roles (IB, PE, VC, etc.) |
| **Recruiters** | HR professionals and hiring managers from finance firms |
| **Schools** | University career services administrators who verify students |
| **Admins** | Platform administrators managing approvals and moderation |

## Tech Stack

- **Framework:** Next.js 15+ (App Router with Server Components)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn/UI + Magic UI
- **Monorepo:** Turborepo + pnpm
- **Deployment:** Vercel (web), Railway (Discord bot)

## Features

### Candidate Portal

#### Profile Management
- **Complete Academic Profile:** School, GPA, major, graduation year, degree types
- **Graduate Education Support:** Separate section for grad school, MBA, JD, PhD
- **Document Uploads:** Resume and transcript storage with verification status
- **Target Roles:** Select preferred finance tracks (IB, PE, VC, HF, etc.)
- **Location Preferences:** Specify desired work locations
- **Bio & LinkedIn:** Personal summary and social links
- **Scheduling URL:** Calendly/booking link for interviews

#### Verification System
- **GPA Verification:** Admin-verified academic performance
- **Resume Verification:** Validated resume documents
- **Transcript Verification:** Official transcript confirmation
- **Visual Badges:** Green checkmarks for verified credentials

#### Profile View Analytics
- See how many recruiters viewed your profile
- Weekly/monthly view counts
- Which firms are viewing (when recruiter allows visibility)

#### Interested Firms
- Express interest in up to 10 firms
- Autocomplete from known recruiters
- Creates warm signal for recruiter outreach
- Firms see "Interested" badge on your profile

### Recruiter Portal

#### Candidate Discovery
- **Advanced Filters:** GPA, major, school, graduation year, target roles
- **Degree Filters:** Undergrad and graduate degree types
- **Real-time Search:** Debounced filtering with instant results
- **Candidate Table:** Sortable list with key metrics

#### Saved Searches
- Save filter combinations for quick access
- Name and manage saved searches
- One-click to apply saved filters

#### Candidate Bookmarking
- Save candidates to shortlist
- Optional notes when bookmarking
- Dedicated "Saved Candidates" page

#### Pipeline Status Tags
- Track candidates through hiring funnel
- Status options: New, Contacted, Interviewing, Offer Extended, Hired, Passed, Not a Fit
- Color-coded badges for visual status
- Filter saved candidates by status

#### Private Notes
- Add private notes on any candidate
- Auto-save with debouncing
- Notes persist across sessions
- Only visible to the recruiter who wrote them

#### Mutual Interest Matching
- See "Interested" badge when candidates express interest in your firm
- Filter candidates who are interested in your firm
- Heart icon in candidate list for quick identification

#### Personalized Recommendations
- AI-powered candidate recommendations
- Based on recruiter preferences and past activity
- Refreshable recommendation carousel

#### Export Functionality
- Export candidate data to CSV
- Include selected fields
- Bulk export capabilities

#### Messaging System
- Direct messaging with candidates
- Conversation threads with history
- Real-time message updates
- Unread message indicators

#### Network
- View other recruiters on the platform
- Visibility controlled by recruiter settings

### School Portal

#### Student Verification
- View students from your university
- Verify academic credentials
- Track verification status

#### Document Review
- Review uploaded transcripts
- Approve or reject documents
- Add verification notes

### Admin Portal

#### Recruiter Approval
- Review new recruiter applications
- Approve or reject with notes
- Track approval history

#### Candidate Management
- View all candidates
- Manage verification status
- Handle rejections

#### School Admin Approval
- Verify career services administrators
- Document verification workflow
- Multi-step approval process

#### Coastal Haven Capital Applications
- Manage internal fund applications
- Filter by application status
- Review and process applications

#### Platform Moderation
- User management tools
- Discord integration for moderation sync
- Ban/unban with reason tracking

### Messaging System

- **Direct Messages:** Recruiters can message candidates
- **Conversation Threads:** Full message history
- **Real-time Updates:** New messages appear instantly
- **Unread Counts:** Track unread messages
- **Candidate Notifications:** See who's messaging you

### Discord Integration

- **Account Linking:** OAuth2 flow to link Discord accounts
- **Role Assignment:** Automatic roles based on user type
- **Moderation Sync:** Bans/kicks sync between website and Discord
- **Custom Bot:** Node.js bot on Railway
- **Community Features:** Dedicated channels for candidates and recruiters

### Analytics

- **Profile Views:** Track who viewed candidate profiles
- **Event Tracking:** All platform interactions logged
- **Recruiter Activity:** View patterns and engagement

## Project Structure

```
coastalhavenpartners/
├── apps/
│   ├── www/                      # Main Next.js application
│   │   ├── app/
│   │   │   ├── (auth)/           # Authentication flows
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── complete-profile/
│   │   │   ├── (marketing)/      # Public marketing pages
│   │   │   ├── (portal)/         # Authenticated portal
│   │   │   │   ├── admin/        # Admin dashboard
│   │   │   │   ├── candidate/    # Candidate dashboard
│   │   │   │   ├── recruiter/    # Recruiter dashboard
│   │   │   │   ├── school/       # School admin dashboard
│   │   │   │   └── messages/     # Messaging system
│   │   │   └── api/              # API routes
│   │   ├── components/
│   │   │   ├── ui/               # Shadcn components
│   │   │   ├── magicui/          # Magic UI animations
│   │   │   ├── candidate/        # Candidate-specific
│   │   │   ├── recruiter/        # Recruiter-specific
│   │   │   └── sections/         # Landing page sections
│   │   ├── lib/
│   │   │   ├── supabase/         # Supabase clients
│   │   │   ├── types/            # TypeScript types
│   │   │   └── utils.ts          # Utilities
│   │   └── supabase/
│   │       └── migrations/       # Database migrations
│   ├── discord-bot/              # Discord bot (Railway)
│   └── capital/                  # Coastal Haven Capital app
├── turbo.json                    # Turborepo config
└── pnpm-workspace.yaml           # pnpm workspace
```

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Core user identity (extends auth.users) |
| `candidate_profiles` | Candidate academic and professional data |
| `recruiter_profiles` | Recruiter and firm information |
| `school_profiles` | Career services admin profiles |

### Feature Tables

| Table | Purpose |
|-------|---------|
| `applications` | Coastal Haven Capital applications |
| `bookmarked_candidates` | Saved candidates with status tags |
| `recruiter_candidate_notes` | Private recruiter notes on candidates |
| `candidate_firm_interests` | Candidate interested firms (mutual matching) |
| `conversations` | Messaging conversations |
| `messages` | Individual messages |
| `saved_searches` | Recruiter saved search filters |
| `analytics_events` | Platform activity tracking |

### Moderation Tables

| Table | Purpose |
|-------|---------|
| `moderation_actions` | Platform moderation log |
| `discord_reports` | Discord community reports |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- Supabase account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd coastalhavenpartners

# Install dependencies
pnpm install

# Set up environment variables
cp apps/www/.env.example apps/www/.env.local
# Edit .env.local with your Supabase credentials

# Push database migrations
cd apps/www
pnpm supabase db push

# Start development server
pnpm dev
```

### Environment Variables

```bash
# apps/www/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Discord OAuth (optional)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (port 3000)

# Building
pnpm build            # Build all packages
pnpm typecheck        # Type check TypeScript

# Code Quality
pnpm check            # Run lint + typecheck + format
pnpm lint             # Lint all code
pnpm format:fix       # Fix formatting

# Database
pnpm supabase db push                           # Apply migrations
pnpm supabase gen types typescript --project-id <id>  # Regenerate types
```

## Feature Implementation Status

### Completed Features

| Feature | Status |
|---------|--------|
| User authentication (Supabase Auth) | Done |
| Candidate profiles with verification | Done |
| Recruiter profiles with visibility controls | Done |
| School admin profiles | Done |
| Admin approval workflows | Done |
| Advanced candidate filtering | Done |
| Saved searches | Done |
| Candidate bookmarking | Done |
| Pipeline status tags | Done |
| Private recruiter notes | Done |
| Mutual interest matching | Done |
| Profile view analytics | Done |
| Direct messaging | Done |
| Candidate recommendations | Done |
| CSV export | Done |
| Discord integration | Done |
| Coastal Haven Capital applications | Done |
| Document verification | Done |

### Planned Features

| Feature | Priority |
|---------|----------|
| Bulk actions (multi-select) | Medium |
| Cohort/class pages | Medium |
| Recruiter firm profiles | Medium |
| Referral system | Medium |
| Interview prep resources | Low |
| School ambassador program | Low |

## Troubleshooting

### Supabase Type Mismatches

If TypeScript types don't match the database:

```bash
cd apps/www
pnpm supabase gen types typescript --project-id <your-project-id> > lib/types/database.types.ts
```

### Ambiguous Foreign Key Joins

When a table has multiple FKs to the same table, use explicit constraint names:

```typescript
// Wrong
.select('*, profiles(*)')

// Correct
.select('*, profiles!recruiter_profiles_user_id_fkey(full_name, email)')
```

### RLS Policy Issues

If queries return empty results unexpectedly:
1. Check RLS policies in migrations
2. Verify user has correct role in `profiles` table
3. Temporarily disable RLS to confirm it's a policy issue

## Contributing

1. Create a feature branch from `main`
2. Make changes and test locally
3. Run `pnpm check` before committing
4. Submit pull request with description

## Architecture Decisions

### Why Server Components?
Most pages use React Server Components for:
- Direct database access without API routes
- Reduced client-side JavaScript
- Improved SEO and initial load time

### Why Supabase?
- Built-in authentication
- Row Level Security for data protection
- Real-time subscriptions for messaging
- PostgreSQL with full SQL support

### Why Magic UI?
- Pre-built animated components
- GPU-accelerated animations
- Consistent design language

## License

Proprietary - All rights reserved
