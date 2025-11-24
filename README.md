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
