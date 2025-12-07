'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'

export async function completeCandidateProfile(data: {
  schoolName: string
  major: string
  gpa: number
  graduationYear: number
}) {
  // Get the current user from the server client
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to complete your profile')
  }

  console.log('Completing candidate profile for:', user.id)

  // Use service role to bypass RLS for profile creation
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

  // Check if profile already exists
  const { data: existingProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingProfile) {
    // Profile already exists - this is likely an RLS visibility issue
    // Force revalidate and return success to refresh the page
    console.log('Candidate profile already exists, revalidating cache')
    revalidatePath('/candidate')
    return { success: true, alreadyExists: true }
  }

  // Ensure base profile exists (it should from the trigger, but just in case)
  const { data: baseProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!baseProfile) {
    // Create base profile if it doesn't exist
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || 'User',
        role: 'candidate',
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error creating base profile:', profileError)
      throw new Error('Failed to create base profile')
    }
  }

  // Create candidate profile
  const { data: candidateProfile, error } = await supabaseAdmin
    .from('candidate_profiles')
    .insert({
      user_id: user.id,
      school_name: data.schoolName,
      major: data.major,
      gpa: data.gpa,
      graduation_year: data.graduationYear,
      status: 'pending_verification',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating candidate profile:', error)
    throw new Error(`Failed to create candidate profile: ${error.message}`)
  }

  if (!candidateProfile) {
    throw new Error('Candidate profile was not created')
  }

  console.log('Candidate profile completed successfully:', candidateProfile.id)
  return { success: true }
}

/**
 * Trigger automatic GPA verification for a transcript
 * Can be called by candidates after uploading a transcript
 */
export async function triggerTranscriptVerification(transcriptId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Use admin client to verify ownership and trigger verification
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

  // Verify the transcript belongs to this user
  const { data: transcript, error: transcriptError } = await supabaseAdmin
    .from('candidate_transcripts')
    .select('id, candidate_profile_id, user_id, gpa')
    .eq('id', transcriptId)
    .single()

  if (transcriptError || !transcript) {
    return { success: false, error: 'Transcript not found' }
  }

  if (transcript.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Only verify if transcript has a GPA entered
  if (transcript.gpa === null) {
    return { success: true, skipped: true, reason: 'No GPA entered' }
  }

  // Trigger verification in the background (don't wait for it)
  // This allows the user to continue while verification runs
  try {
    const { verifyTranscript } = await import('@/lib/transcript-verification')

    // Run verification asynchronously - don't await
    verifyTranscript(transcript.candidate_profile_id, transcriptId)
      .then((result) => {
        console.log('[Auto-Verify] Completed for transcript', transcriptId, result.status)
      })
      .catch((error) => {
        console.error('[Auto-Verify] Failed for transcript', transcriptId, error)
      })

    return { success: true, message: 'Verification started' }
  } catch (error) {
    console.error('[Auto-Verify] Error starting verification:', error)
    return { success: false, error: 'Failed to start verification' }
  }
}

/**
 * Delete the current user's account and all associated data
 * This is a destructive operation that cannot be undone
 */
export async function deleteAccount(confirmationText: string) {
  // Require explicit confirmation
  if (confirmationText !== 'DELETE MY ACCOUNT') {
    return { success: false, error: 'Please type "DELETE MY ACCOUNT" to confirm' }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Use admin client for deletion operations
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
    // 1. Get candidate profile ID
    const { data: candidateProfile } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (candidateProfile) {
      // 2. Delete transcript verifications
      await supabaseAdmin
        .from('transcript_verifications')
        .delete()
        .eq('candidate_profile_id', candidateProfile.id)

      // 3. Delete resume verifications
      await supabaseAdmin
        .from('resume_verifications')
        .delete()
        .eq('candidate_profile_id', candidateProfile.id)

      // 4. Get and delete transcripts (including storage files)
      const { data: transcripts } = await supabaseAdmin
        .from('candidate_transcripts')
        .select('transcript_url')
        .eq('candidate_profile_id', candidateProfile.id)

      if (transcripts) {
        for (const transcript of transcripts) {
          // Extract file path from URL and delete from storage
          const url = new URL(transcript.transcript_url)
          const pathMatch = url.pathname.match(/\/transcripts\/(.+)$/)
          if (pathMatch) {
            await supabaseAdmin.storage.from('transcripts').remove([pathMatch[1]])
          }
        }
      }

      await supabaseAdmin
        .from('candidate_transcripts')
        .delete()
        .eq('candidate_profile_id', candidateProfile.id)

      // 5. Get and delete resumes (including storage files)
      const { data: resumes } = await supabaseAdmin
        .from('candidate_resumes')
        .select('resume_url')
        .eq('candidate_profile_id', candidateProfile.id)

      if (resumes) {
        for (const resume of resumes) {
          const url = new URL(resume.resume_url)
          const pathMatch = url.pathname.match(/\/resumes\/(.+)$/)
          if (pathMatch) {
            await supabaseAdmin.storage.from('resumes').remove([pathMatch[1]])
          }
        }
      }

      await supabaseAdmin
        .from('candidate_resumes')
        .delete()
        .eq('candidate_profile_id', candidateProfile.id)

      // 6. Delete firm interests
      await supabaseAdmin
        .from('candidate_firm_interests')
        .delete()
        .eq('candidate_id', candidateProfile.id)

      // 7. Delete job applications
      await supabaseAdmin
        .from('applications')
        .delete()
        .eq('candidate_profile_id', candidateProfile.id)

      // 8. Delete referrals (where user is referrer)
      await supabaseAdmin
        .from('referrals')
        .delete()
        .eq('referrer_id', user.id)

      // 9. Delete candidate profile
      await supabaseAdmin
        .from('candidate_profiles')
        .delete()
        .eq('id', candidateProfile.id)
    }

    // 10. Delete messages
    await supabaseAdmin
      .from('messages')
      .delete()
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)

    // 11. Delete conversations
    await supabaseAdmin
      .from('conversation_participants')
      .delete()
      .eq('user_id', user.id)

    // 12. Delete notifications (if table exists)
    try {
      await supabaseAdmin
        .from('user_notifications' as any)
        .delete()
        .eq('user_id', user.id)
    } catch {
      // Table may not exist - continue
    }

    // 13. Delete push subscriptions
    await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)

    // 14. Delete base profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)

    // 15. Delete the auth user (this will sign them out)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      // Continue anyway - the profile data is already deleted
    }

    // Sign out the user
    await supabase.auth.signOut()

    return { success: true }
  } catch (error) {
    console.error('Error deleting account:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete account'
    }
  }
}

