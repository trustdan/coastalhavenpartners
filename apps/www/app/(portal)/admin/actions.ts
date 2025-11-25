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

  // Get recruiter profile for email
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('user_id')
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

  // Approve recruiter
  const { error } = await supabaseAdmin
    .from('recruiter_profiles')
    .update({ 
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id
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
