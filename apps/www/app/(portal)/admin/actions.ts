'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database.types'

// Helper to get admin client that bypasses RLS
function getAdminClient() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper to get untyped admin client for new tables not in types yet
// (transcript_verifications - run `pnpm supabase gen types` after migration)
function getUntypedAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper to verify admin status
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const supabaseAdmin = getAdminClient()
  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') throw new Error('Unauthorized')

  return { user, supabaseAdmin }
}

export async function approveRecruiter(recruiterId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  // Get recruiter profile with firm info
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('user_id, firm_id, firm_name, firm_type, company_website, locations')
    .eq('id', recruiterId)
    .single()

  // Get the user's profile for email
  let userProfile = null
  if (recruiterProfile?.user_id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', recruiterProfile.user_id)
      .single()
    userProfile = profile
  }

  // If recruiter doesn't have a firm_id yet, auto-create the firm
  let firmId = recruiterProfile?.firm_id
  if (!firmId && recruiterProfile?.firm_name) {
    // Generate a slug
    const baseSlug = recruiterProfile.firm_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check for slug uniqueness
    let slug = baseSlug
    let counter = 0
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('firms')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) break
      counter++
      slug = `${baseSlug}-${counter}`
    }

    // Create the firm
    const { data: newFirm, error: firmError } = await supabaseAdmin
      .from('firms')
      .insert({
        name: recruiterProfile.firm_name,
        slug,
        website: recruiterProfile.company_website,
        locations: recruiterProfile.locations,
        firm_type: recruiterProfile.firm_type,
        is_visible: true,
      })
      .select()
      .single()

    if (firmError) {
      console.error('Error creating firm:', firmError)
    } else {
      firmId = newFirm.id
    }
  }

  // Approve recruiter and link to firm
  const { error } = await supabaseAdmin
    .from('recruiter_profiles')
    .update({
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      firm_id: firmId, // Link to firm (either existing or newly created)
    })
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  // Send Email Notification
  if (userProfile?.email) {
    try {
      const { resend, FROM_EMAIL } = await import('@/lib/resend')
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userProfile.email,
        subject: 'Welcome to Coastal Haven Partners',
        html: `
          <h1>You're Approved!</h1>
          <p>Hi ${userProfile.full_name},</p>
          <p>Your recruiter account has been approved by our admin team.</p>
          <p>You can now log in and start searching for candidates:</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/recruiter">
              Go to Dashboard
            </a>
          </p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
    }
  }

  revalidatePath('/admin')
}

export async function rejectRecruiter(recruiterId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  // Reject/revoke recruiter access
  const { error } = await supabaseAdmin
    .from('recruiter_profiles')
    .update({ 
      is_approved: false,
      is_rejected: true,
      rejected_at: new Date().toISOString(),
      rejected_by: user.id
    })
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function reinstateRecruiter(recruiterId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  // Reinstate a rejected recruiter (moves them back to pending)
  const { error } = await supabaseAdmin
    .from('recruiter_profiles')
    .update({
      is_rejected: false,
      rejected_at: null,
      rejected_by: null
    })
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function updateVerificationNotes(recruiterId: string, notes: string) {
  const { supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('recruiter_profiles')
    .update({ verification_notes: notes })
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function verifyCandidate(candidateId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({ status: 'verified' })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/candidates')
}

export async function rejectCandidate(candidateId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  // Reject candidate
  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({ 
      status: 'rejected',
      is_rejected: true,
      rejected_at: new Date().toISOString(),
      rejected_by: user.id
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/candidates')
}

export async function reinstateCandidate(candidateId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  // Reinstate a rejected candidate (moves them back to pending)
  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({ 
      status: 'pending_verification',
      is_rejected: false,
      rejected_at: null,
      rejected_by: null
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/candidates')
}

export async function revokeCandidate(candidateId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  // Revoke a verified candidate (reject them)
  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({ 
      status: 'rejected',
      is_rejected: true,
      rejected_at: new Date().toISOString(),
      rejected_by: user.id
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/candidates')
}

// =============================================
// SCHOOL ADMIN ACTIONS
// =============================================

export async function approveSchool(schoolId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  // Get school profile for email
  const { data: schoolProfile } = await supabaseAdmin
    .from('school_profiles')
    .select('user_id')
    .eq('id', schoolId)
    .single()

  // Get the user's profile for email
  let userProfile = null
  if (schoolProfile?.user_id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', schoolProfile.user_id)
      .single()
    userProfile = profile
  }

  // Approve school
  const { error } = await supabaseAdmin
    .from('school_profiles')
    .update({ 
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id
    })
    .eq('id', schoolId)

  if (error) throw new Error(error.message)

  // Send Email Notification
  if (userProfile?.email) {
    try {
      const { resend, FROM_EMAIL } = await import('@/lib/resend')
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userProfile.email,
        subject: 'Your School Account is Approved - Coastal Haven Partners',
        html: `
          <h1>Welcome to Coastal Haven Partners!</h1>
          <p>Hi ${userProfile.full_name},</p>
          <p>Your school career services account has been approved.</p>
          <p>You can now log in and view your students' profiles and connect them with recruiters:</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/school">
              Go to Dashboard
            </a>
          </p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
    }
  }

  revalidatePath('/admin/schools')
}

export async function rejectSchool(schoolId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  // Reject/revoke school access
  const { error } = await supabaseAdmin
    .from('school_profiles')
    .update({ 
      is_approved: false,
      is_rejected: true,
      rejected_at: new Date().toISOString(),
      rejected_by: user.id
    })
    .eq('id', schoolId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/schools')
}

export async function reinstateSchool(schoolId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  // Reinstate a rejected school (moves them back to pending)
  const { error } = await supabaseAdmin
    .from('school_profiles')
    .update({
      is_rejected: false,
      rejected_at: null,
      rejected_by: null
    })
    .eq('id', schoolId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/schools')
}

// =============================================
// DOCUMENT VERIFICATION ACTIONS
// =============================================

export async function verifyResume(candidateId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({
      resume_verified: true,
      documents_verified_by: user.id,
      documents_verified_at: new Date().toISOString()
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function rejectResume(candidateId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({
      resume_verified: false,
      resume_url: null // Clear the rejected resume
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function verifyTranscript(candidateId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({
      transcript_verified: true,
      documents_verified_by: user.id,
      documents_verified_at: new Date().toISOString()
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function rejectTranscript(candidateId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({
      transcript_verified: false,
      transcript_url: null // Clear the rejected transcript
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function verifyGpa(candidateId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({
      gpa_verified: true,
      documents_verified_by: user.id,
      documents_verified_at: new Date().toISOString()
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function rejectGpa(candidateId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .update({
      gpa_verified: false
    })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

// =============================================
// INDIVIDUAL TRANSCRIPT VERIFICATION ACTIONS
// (for candidate_transcripts table - multiple transcripts per candidate)
// =============================================

export async function verifyIndividualTranscript(transcriptId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_transcripts')
    .update({
      is_verified: true,
      verified_by: user.id,
      verified_at: new Date().toISOString()
    })
    .eq('id', transcriptId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function rejectIndividualTranscript(transcriptId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  // Delete the transcript record (candidate can upload a new one)
  const { error } = await supabaseAdmin
    .from('candidate_transcripts')
    .delete()
    .eq('id', transcriptId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function verifyIndividualTranscriptGpa(transcriptId: string) {
  const { user, supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_transcripts')
    .update({
      gpa_verified: true,
      verified_by: user.id,
      verified_at: new Date().toISOString()
    })
    .eq('id', transcriptId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

export async function rejectIndividualTranscriptGpa(transcriptId: string) {
  const { supabaseAdmin } = await verifyAdmin()

  const { error } = await supabaseAdmin
    .from('candidate_transcripts')
    .update({
      gpa_verified: false
    })
    .eq('id', transcriptId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/verification')
}

// =============================================
// AUTO GPA VERIFICATION ACTIONS
// (using Document AI + Claude for automated GPA extraction)
// =============================================

export async function autoVerifyTranscript(candidateProfileId: string, transcriptId: string) {
  await verifyAdmin()

  const { verifyTranscript } = await import('@/lib/transcript-verification')
  const result = await verifyTranscript(candidateProfileId, transcriptId)

  revalidatePath('/admin/verification')
  return result
}

export async function bulkAutoVerifyTranscripts(limit = 50) {
  await verifyAdmin()

  const { bulkVerifyTranscripts } = await import('@/lib/transcript-verification')
  const result = await bulkVerifyTranscripts(limit)

  revalidatePath('/admin/verification')
  return result
}

export async function reprocessFlaggedTranscripts(limit = 50) {
  await verifyAdmin()

  const { reprocessFlaggedTranscripts } = await import('@/lib/transcript-verification')
  const result = await reprocessFlaggedTranscripts(limit)

  revalidatePath('/admin/verification')
  return result
}

export async function getAutoVerificationQueue() {
  await verifyAdmin()

  const { getVerificationQueue } = await import('@/lib/transcript-verification')
  return getVerificationQueue()
}

export async function getAutoVerificationStats() {
  await verifyAdmin()

  const { getVerificationStats } = await import('@/lib/transcript-verification')
  return getVerificationStats()
}

export async function manuallyVerifyAutoVerification(
  verificationId: string,
  decision: 'verified' | 'rejected',
  notes: string
) {
  const { user, supabaseAdmin } = await verifyAdmin()
  const supabaseUntyped = getUntypedAdminClient()

  // Get the verification record (using untyped client for new table)
  const { data: verification, error: fetchError } = await supabaseUntyped
    .from('transcript_verifications')
    .select('candidate_profile_id, transcript_id')
    .eq('id', verificationId)
    .single()

  if (fetchError || !verification) throw new Error('Verification not found')

  // Update verification record
  const { error: updateError } = await supabaseUntyped
    .from('transcript_verifications')
    .update({
      status: decision === 'verified' ? 'manually_verified' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', verificationId)

  if (updateError) throw new Error(updateError.message)

  // Update candidate_transcripts based on decision
  if (verification.transcript_id) {
    await supabaseAdmin
      .from('candidate_transcripts')
      .update({
        gpa_verified: decision === 'verified',
        is_verified: decision === 'verified',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verification.transcript_id)
  }

  // Update candidate profile status (gpa_verification_status is also new)
  await supabaseUntyped
    .from('candidate_profiles')
    .update({
      gpa_verification_status: decision,
    })
    .eq('id', verification.candidate_profile_id)

  revalidatePath('/admin/verification')
}

// =============================================
// AUTO RESUME VERIFICATION ACTIONS
// (using Claude vision for automated resume authenticity checks)
// =============================================

export async function autoVerifyResume(candidateProfileId: string, resumeId: string) {
  await verifyAdmin()

  const { verifyResume } = await import('@/lib/resume-verification')
  const result = await verifyResume(candidateProfileId, resumeId)

  revalidatePath('/admin/verification')
  return result
}

export async function bulkAutoVerifyResumes(limit = 50) {
  await verifyAdmin()

  const { bulkVerifyResumes } = await import('@/lib/resume-verification')
  const result = await bulkVerifyResumes(limit)

  revalidatePath('/admin/verification')
  return result
}

export async function reprocessFlaggedResumes(limit = 50) {
  await verifyAdmin()

  const { reprocessFlaggedResumes } = await import('@/lib/resume-verification')
  const result = await reprocessFlaggedResumes(limit)

  revalidatePath('/admin/verification')
  return result
}

export async function getResumeAutoVerificationQueue() {
  await verifyAdmin()

  const { getResumeVerificationQueue } = await import('@/lib/resume-verification')
  return getResumeVerificationQueue()
}

export async function getResumeAutoVerificationStats() {
  await verifyAdmin()

  const { getResumeVerificationStats } = await import('@/lib/resume-verification')
  return getResumeVerificationStats()
}

export async function manuallyVerifyResumeVerification(
  verificationId: string,
  decision: 'verified' | 'rejected',
  notes: string
) {
  const { user, supabaseAdmin } = await verifyAdmin()
  const supabaseUntyped = getUntypedAdminClient()

  // Get the verification record
  const { data: verification, error: fetchError } = await supabaseUntyped
    .from('resume_verifications')
    .select('candidate_profile_id, resume_id')
    .eq('id', verificationId)
    .single()

  if (fetchError || !verification) throw new Error('Verification not found')

  // Update verification record
  const { error: updateError } = await supabaseUntyped
    .from('resume_verifications')
    .update({
      status: decision === 'verified' ? 'manually_verified' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', verificationId)

  if (updateError) throw new Error(updateError.message)

  // Update candidate_resumes based on decision
  if (verification.resume_id) {
    await supabaseAdmin
      .from('candidate_resumes')
      .update({
        is_verified: decision === 'verified',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verification.resume_id)
  }

  // Update candidate profile resume verification status
  await supabaseUntyped
    .from('candidate_profiles')
    .update({
      resume_verification_status: decision,
    })
    .eq('id', verification.candidate_profile_id)

  revalidatePath('/admin/verification')
}
