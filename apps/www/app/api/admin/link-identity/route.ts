import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

interface LinkIdentityRequest {
  primary_user_id: string
  duplicate_user_id: string
}

interface MergeAccountsRequest {
  primary_user_id: string
  duplicate_user_id: string
  delete_duplicate: boolean
}

/**
 * POST /api/admin/link-identity
 * Merge duplicate accounts by transferring data and optionally deleting the duplicate
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user is admin
  const { data: admin } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: MergeAccountsRequest = await request.json()
  const { primary_user_id, duplicate_user_id, delete_duplicate } = body

  if (!primary_user_id || !duplicate_user_id) {
    return NextResponse.json(
      { error: 'Missing required fields: primary_user_id and duplicate_user_id' },
      { status: 400 }
    )
  }

  if (primary_user_id === duplicate_user_id) {
    return NextResponse.json(
      { error: 'Cannot merge account with itself' },
      { status: 400 }
    )
  }

  // Use service role for admin operations
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Verify both users exist
    const { data: primaryUser, error: primaryError } = await supabaseAdmin.auth.admin.getUserById(primary_user_id)
    if (primaryError || !primaryUser) {
      return NextResponse.json({ error: 'Primary user not found' }, { status: 404 })
    }

    const { data: duplicateUser, error: duplicateError } = await supabaseAdmin.auth.admin.getUserById(duplicate_user_id)
    if (duplicateError || !duplicateUser) {
      return NextResponse.json({ error: 'Duplicate user not found' }, { status: 404 })
    }

    // Check if emails match (safety check)
    if (primaryUser.user.email !== duplicateUser.user.email) {
      return NextResponse.json(
        { error: 'Users must have the same email address to merge' },
        { status: 400 }
      )
    }

    // Check for data in duplicate account's profile
    const { data: duplicateProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', duplicate_user_id)
      .single()

    const { data: duplicateCandidateProfile } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', duplicate_user_id)
      .single()

    const { data: duplicateRecruiterProfile } = await supabaseAdmin
      .from('recruiter_profiles')
      .select('*')
      .eq('user_id', duplicate_user_id)
      .single()

    // Prevent merge if duplicate has important data
    if (duplicateCandidateProfile || duplicateRecruiterProfile) {
      return NextResponse.json({
        error: 'Duplicate account has profile data that would be lost. Manual data migration required.',
        has_candidate_profile: !!duplicateCandidateProfile,
        has_recruiter_profile: !!duplicateRecruiterProfile
      }, { status: 400 })
    }

    // Perform the merge
    const operations: string[] = []

    // Delete duplicate's profile if exists (should be empty/minimal)
    if (duplicateProfile) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', duplicate_user_id)

      if (!profileError) {
        operations.push('Deleted empty profile')
      }
    }

    // Delete the duplicate auth user if requested
    if (delete_duplicate) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(duplicate_user_id)

      if (deleteError) {
        return NextResponse.json({
          error: `Failed to delete duplicate user: ${deleteError.message}`,
          partial_operations: operations
        }, { status: 500 })
      }

      operations.push('Deleted auth user')
    }

    return NextResponse.json({
      success: true,
      message: 'Accounts merged successfully',
      operations,
      primary_user_id,
      deleted_user_id: delete_duplicate ? duplicate_user_id : null
    })

  } catch (error) {
    console.error('Identity linking error:', error)
    return NextResponse.json(
      { error: 'Failed to merge accounts' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/link-identity
 * Find duplicate accounts by email
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

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

  const email = request.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json(
      { error: 'Missing email parameter' },
      { status: 400 }
    )
  }

  // Use service role to query auth.users
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // List all users and filter by email (Supabase doesn't have email filter in listUsers)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const matchingUsers = users.filter(u => u.email?.toLowerCase() === email.toLowerCase())

    // Get profile info for each matching user
    const usersWithProfiles = await Promise.all(
      matchingUsers.map(async (u) => {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role, full_name, created_at')
          .eq('id', u.id)
          .single()

        const { data: candidateProfile } = await supabaseAdmin
          .from('candidate_profiles')
          .select('id')
          .eq('user_id', u.id)
          .single()

        const { data: recruiterProfile } = await supabaseAdmin
          .from('recruiter_profiles')
          .select('id')
          .eq('user_id', u.id)
          .single()

        return {
          id: u.id,
          email: u.email,
          provider: u.app_metadata?.provider || 'email',
          providers: u.app_metadata?.providers || ['email'],
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          has_profile: !!profile,
          profile_role: profile?.role,
          profile_name: profile?.full_name,
          has_candidate_profile: !!candidateProfile,
          has_recruiter_profile: !!recruiterProfile
        }
      })
    )

    return NextResponse.json({
      email,
      users: usersWithProfiles,
      has_duplicates: usersWithProfiles.length > 1
    })

  } catch (error) {
    console.error('Error finding duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to find duplicate accounts' },
      { status: 500 }
    )
  }
}
