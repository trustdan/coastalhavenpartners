'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveRecruiter(recruiterId: string) {
  const supabase = await createClient()

  // check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') throw new Error('Unauthorized')

  // Get recruiter profile for email
  // Using explicit hint !user_id to avoid ambiguity with approved_by column
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select(`
      user_id,
      profiles!user_id (
        email,
        full_name
      )
    `)
    .eq('id', recruiterId)
    .single()

  // Approve recruiter
  const { error } = await supabase
    .from('recruiter_profiles')
    .update({ 
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id
    })
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  // Send Email Notification
  if (recruiterProfile?.profiles?.email) {
    try {
      const { resend, FROM_EMAIL } = await import('@/lib/resend')
      await resend.emails.send({
        from: FROM_EMAIL,
        to: recruiterProfile.profiles.email,
        subject: 'Welcome to Coastal Haven Partners',
        html: `
          <h1>You're Approved!</h1>
          <p>Hi ${recruiterProfile.profiles.full_name},</p>
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
  const supabase = await createClient()

  // check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') throw new Error('Unauthorized')

  // Unapprove/Reject recruiter (set is_approved = false)
  const { error } = await supabase
    .from('recruiter_profiles')
    .update({ is_approved: false })
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function verifyCandidate(candidateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') throw new Error('Unauthorized')

  const { error } = await supabase
    .from('candidate_profiles')
    .update({ status: 'verified' })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/candidates')
}

export async function revokeCandidate(candidateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') throw new Error('Unauthorized')

  // Revert status to 'pending_verification' (or just 'rejected' if preferred, but 'pending_verification' is safer for re-review)
  // Let's use 'pending_verification' as "Revoke" usually means "needs review again"
  const { error } = await supabase
    .from('candidate_profiles')
    .update({ status: 'pending_verification' })
    .eq('id', candidateId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/candidates')
}
