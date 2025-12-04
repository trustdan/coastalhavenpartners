'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database.types'

type JobListing = Database['public']['Tables']['job_listings']['Row']
type JobType = Database['public']['Enums']['job_type']

export interface JobFilters {
  job_type?: JobType
  location?: string
  target_role?: string
  search?: string
}

export async function getActiveJobListings(filters?: JobFilters): Promise<(JobListing & { firm: { name: string; logo_url: string | null; slug: string } | null })[]> {
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let query = supabaseAdmin
    .from('job_listings')
    .select(`
      *,
      firm:firms!firm_id (
        name,
        logo_url,
        slug
      )
    `)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.job_type) {
    query = query.eq('job_type', filters.job_type)
  }

  if (filters?.location) {
    query = query.contains('locations', [filters.location])
  }

  if (filters?.target_role) {
    query = query.contains('target_roles', [filters.target_role])
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data: jobs } = await query

  return (jobs || []) as (JobListing & { firm: { name: string; logo_url: string | null; slug: string } | null })[]
}

export async function getJobBySlug(slug: string): Promise<(JobListing & { firm: { id: string; name: string; logo_url: string | null; slug: string; description: string | null; website: string | null; locations: string[] | null; firm_type: string | null } | null }) | null> {
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: job } = await supabaseAdmin
    .from('job_listings')
    .select(`
      *,
      firm:firms!firm_id (
        id,
        name,
        logo_url,
        slug,
        description,
        website,
        locations,
        firm_type
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (job) {
    // Increment view count
    await supabaseAdmin
      .from('job_listings')
      .update({ view_count: (job.view_count || 0) + 1 })
      .eq('id', job.id)
  }

  return job as (JobListing & { firm: { id: string; name: string; logo_url: string | null; slug: string; description: string | null; website: string | null; locations: string[] | null; firm_type: string | null } | null }) | null
}

export async function getCandidateProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: candidateProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  return candidateProfile
}

export async function getCandidateResumes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: candidateProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return []

  const { data: resumes } = await supabaseAdmin
    .from('candidate_resumes')
    .select('id, label, is_default')
    .eq('candidate_profile_id', candidateProfile.id)
    .order('is_default', { ascending: false })
    .order('label', { ascending: true })

  return resumes || []
}

export async function hasAppliedToJob(jobId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: candidateProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return false

  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('candidate_profile_id', candidateProfile.id)
    .eq('job_listing_id', jobId)
    .maybeSingle()

  return !!application
}

export async function applyToJob(
  jobId: string,
  coverLetter: string,
  resumeId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Use the database function to apply
  const { data, error } = await supabase.rpc('apply_to_job', {
    p_job_listing_id: jobId,
    p_cover_letter: coverLetter,
    p_resume_id: resumeId,
  })

  if (error) {
    console.error('Error applying to job:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/candidate/jobs')
  revalidatePath('/candidate/my-applications')
  return { success: true }
}

export async function getMyApplications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: candidateProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return []

  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      cover_letter,
      job_listing_id,
      job_listings!job_listing_id (
        id,
        title,
        slug,
        job_type,
        status,
        firm:firms!firm_id (
          name,
          logo_url,
          slug
        )
      )
    `)
    .eq('candidate_profile_id', candidateProfile.id)
    .eq('target_type', 'firm')
    .not('job_listing_id', 'is', null)
    .order('applied_at', { ascending: false })

  return applications || []
}

export async function withdrawApplication(applicationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify the application belongs to the user
  const { data: candidateProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) {
    return { success: false, error: 'Candidate profile not found' }
  }

  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('id, status, job_listing_id')
    .eq('id', applicationId)
    .eq('candidate_profile_id', candidateProfile.id)
    .single()

  if (!application) {
    return { success: false, error: 'Application not found' }
  }

  if (application.status === 'withdrawn') {
    return { success: false, error: 'Application already withdrawn' }
  }

  // Update application status
  const { error } = await supabaseAdmin
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)

  if (error) {
    console.error('Error withdrawing application:', error)
    return { success: false, error: error.message }
  }

  // Decrement application count on job listing
  if (application.job_listing_id) {
    const { data: job } = await supabaseAdmin
      .from('job_listings')
      .select('application_count')
      .eq('id', application.job_listing_id)
      .single()

    if (job && job.application_count > 0) {
      await supabaseAdmin
        .from('job_listings')
        .update({ application_count: job.application_count - 1 })
        .eq('id', application.job_listing_id)
    }
  }

  revalidatePath('/candidate/my-applications')
  return { success: true }
}
