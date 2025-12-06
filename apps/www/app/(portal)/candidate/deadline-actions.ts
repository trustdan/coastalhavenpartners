'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpcomingDeadline {
  id: string
  title: string
  slug: string
  job_type: string
  application_deadline: string
  locations: string[] | null
  target_roles: string[] | null
  target_grad_years: number[] | null
  firm_id: string
  firm_name: string
  firm_slug: string
  firm_logo_url: string | null
  firm_type: string
  has_reminder: boolean
}

interface DeadlineReminder {
  job_listing_id: string
}

export async function getUpcomingDeadlines(limit: number = 5): Promise<UpcomingDeadline[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get candidate profile
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id, target_roles, graduation_year')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return []

  // Get upcoming deadlines from view (cast to any since types not yet generated)
  const { data: deadlines, error } = await (supabase as any)
    .from('upcoming_deadlines')
    .select('*')
    .limit(limit)

  if (error || !deadlines) return []

  // Get user's reminders (cast to any since types not yet generated)
  const { data: reminders } = await (supabase as any)
    .from('deadline_reminders')
    .select('job_listing_id')
    .eq('candidate_profile_id', candidateProfile.id) as { data: DeadlineReminder[] | null }

  const reminderJobIds = new Set(reminders?.map(r => r.job_listing_id) || [])

  // Add has_reminder flag to each deadline
  return (deadlines as UpcomingDeadline[]).map(deadline => ({
    ...deadline,
    has_reminder: reminderJobIds.has(deadline.id)
  }))
}

export async function getUpcomingDeadlinesForPage(): Promise<UpcomingDeadline[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get candidate profile
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return []

  // Get all upcoming deadlines (no limit) - cast to any since types not yet generated
  const { data: deadlines, error } = await (supabase as any)
    .from('upcoming_deadlines')
    .select('*')

  if (error || !deadlines) return []

  // Get user's reminders (cast to any since types not yet generated)
  const { data: reminders } = await (supabase as any)
    .from('deadline_reminders')
    .select('job_listing_id')
    .eq('candidate_profile_id', candidateProfile.id) as { data: DeadlineReminder[] | null }

  const reminderJobIds = new Set(reminders?.map(r => r.job_listing_id) || [])

  return (deadlines as UpcomingDeadline[]).map(deadline => ({
    ...deadline,
    has_reminder: reminderJobIds.has(deadline.id)
  }))
}

export async function toggleDeadlineReminder(jobListingId: string, daysBefore: number = 3) {
  const supabase = await createClient()

  // Cast to any since types not yet generated for this function
  const { data, error } = await (supabase as any).rpc('toggle_deadline_reminder', {
    p_job_listing_id: jobListingId,
    p_days_before: daysBefore
  })

  if (error) {
    console.error('Error toggling reminder:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/deadlines')

  return { success: true, data }
}

export async function getDeadlineReminderCount(): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  // Get candidate profile
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return 0

  // Count deadlines in the next 7 days (cast to any since types not yet generated)
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const { count } = await (supabase as any)
    .from('upcoming_deadlines')
    .select('id', { count: 'exact', head: true })
    .lte('application_deadline', sevenDaysFromNow.toISOString())

  return count || 0
}
