'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database.types'

type JobListing = Database['public']['Tables']['job_listings']['Row']
type JobListingInsert = Database['public']['Tables']['job_listings']['Insert']
type JobListingUpdate = Database['public']['Tables']['job_listings']['Update']
type JobType = Database['public']['Enums']['job_type']
type JobListingStatus = Database['public']['Enums']['job_listing_status']

export interface JobFormData {
  title: string
  job_type: JobType
  description: string
  requirements?: string
  responsibilities?: string
  target_roles?: string[]
  locations?: string[]
  target_schools?: string[]
  min_gpa?: number
  target_grad_years?: number[]
  compensation_range?: string
  application_deadline?: string
  start_date?: string
  external_url?: string
  application_instructions?: string
}

// Generate slug from title and firm name
function generateSlug(title: string, firmName: string): string {
  const base = `${firmName}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}

export async function getRecruiterProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id, firm_name, is_approved')
    .eq('user_id', user.id)
    .single()

  return recruiterProfile
}

export async function getJobListings(): Promise<JobListing[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get recruiter's firm_id
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) return []

  // Get all jobs for this firm
  const { data: jobs } = await supabaseAdmin
    .from('job_listings')
    .select('*')
    .eq('firm_id', recruiterProfile.firm_id)
    .order('created_at', { ascending: false })

  return jobs || []
}

export async function getJobListing(id: string): Promise<JobListing | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get recruiter's firm_id
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) return null

  // Get job (must belong to recruiter's firm)
  const { data: job } = await supabaseAdmin
    .from('job_listings')
    .select('*')
    .eq('id', id)
    .eq('firm_id', recruiterProfile.firm_id)
    .single()

  return job
}

export async function createJobListing(formData: JobFormData): Promise<{ success: boolean; id?: string; error?: string }> {
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

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id, firm_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) {
    return { success: false, error: 'Recruiter profile not found' }
  }

  if (!recruiterProfile.is_approved) {
    return { success: false, error: 'Your account must be verified to post jobs' }
  }

  if (!recruiterProfile.firm_id) {
    return { success: false, error: 'No firm associated with your profile' }
  }

  const slug = generateSlug(formData.title, recruiterProfile.firm_name)

  const jobData: JobListingInsert = {
    firm_id: recruiterProfile.firm_id,
    posted_by: recruiterProfile.id,
    title: formData.title,
    slug,
    job_type: formData.job_type,
    description: formData.description,
    requirements: formData.requirements || null,
    responsibilities: formData.responsibilities || null,
    target_roles: formData.target_roles || null,
    locations: formData.locations || null,
    target_schools: formData.target_schools || null,
    min_gpa: formData.min_gpa || null,
    target_grad_years: formData.target_grad_years || null,
    compensation_range: formData.compensation_range || null,
    application_deadline: formData.application_deadline || null,
    start_date: formData.start_date || null,
    external_url: formData.external_url || null,
    application_instructions: formData.application_instructions || null,
    status: 'draft',
  }

  const { data: job, error } = await supabaseAdmin
    .from('job_listings')
    .insert(jobData)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating job listing:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/jobs')
  return { success: true, id: job.id }
}

export async function updateJobListing(
  id: string,
  formData: Partial<JobFormData>
): Promise<{ success: boolean; error?: string }> {
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

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) {
    return { success: false, error: 'Recruiter profile not found' }
  }

  // Verify job belongs to recruiter's firm
  const { data: existingJob } = await supabaseAdmin
    .from('job_listings')
    .select('id, firm_id')
    .eq('id', id)
    .single()

  if (!existingJob || existingJob.firm_id !== recruiterProfile.firm_id) {
    return { success: false, error: 'Job not found or access denied' }
  }

  const updateData: JobListingUpdate = {
    title: formData.title,
    job_type: formData.job_type,
    description: formData.description,
    requirements: formData.requirements || null,
    responsibilities: formData.responsibilities || null,
    target_roles: formData.target_roles || null,
    locations: formData.locations || null,
    target_schools: formData.target_schools || null,
    min_gpa: formData.min_gpa || null,
    target_grad_years: formData.target_grad_years || null,
    compensation_range: formData.compensation_range || null,
    application_deadline: formData.application_deadline || null,
    start_date: formData.start_date || null,
    external_url: formData.external_url || null,
    application_instructions: formData.application_instructions || null,
  }

  const { error } = await supabaseAdmin
    .from('job_listings')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating job listing:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/jobs')
  revalidatePath(`/recruiter/jobs/${id}`)
  return { success: true }
}

export async function publishJobListing(id: string): Promise<{ success: boolean; error?: string }> {
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

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) {
    return { success: false, error: 'Recruiter profile not found' }
  }

  // Verify job belongs to recruiter's firm
  const { data: existingJob } = await supabaseAdmin
    .from('job_listings')
    .select('id, firm_id')
    .eq('id', id)
    .single()

  if (!existingJob || existingJob.firm_id !== recruiterProfile.firm_id) {
    return { success: false, error: 'Job not found or access denied' }
  }

  const { error } = await supabaseAdmin
    .from('job_listings')
    .update({
      status: 'active',
      published_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error publishing job listing:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/jobs')
  revalidatePath(`/recruiter/jobs/${id}`)
  revalidatePath('/candidate/jobs')
  return { success: true }
}

export async function pauseJobListing(id: string): Promise<{ success: boolean; error?: string }> {
  return updateJobStatus(id, 'paused')
}

export async function closeJobListing(id: string): Promise<{ success: boolean; error?: string }> {
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

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) {
    return { success: false, error: 'Recruiter profile not found' }
  }

  // Verify job belongs to recruiter's firm
  const { data: existingJob } = await supabaseAdmin
    .from('job_listings')
    .select('id, firm_id')
    .eq('id', id)
    .single()

  if (!existingJob || existingJob.firm_id !== recruiterProfile.firm_id) {
    return { success: false, error: 'Job not found or access denied' }
  }

  const { error } = await supabaseAdmin
    .from('job_listings')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error closing job listing:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/jobs')
  revalidatePath(`/recruiter/jobs/${id}`)
  revalidatePath('/candidate/jobs')
  return { success: true }
}

export async function reopenJobListing(id: string): Promise<{ success: boolean; error?: string }> {
  return updateJobStatus(id, 'active')
}

async function updateJobStatus(id: string, status: JobListingStatus): Promise<{ success: boolean; error?: string }> {
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

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) {
    return { success: false, error: 'Recruiter profile not found' }
  }

  // Verify job belongs to recruiter's firm
  const { data: existingJob } = await supabaseAdmin
    .from('job_listings')
    .select('id, firm_id')
    .eq('id', id)
    .single()

  if (!existingJob || existingJob.firm_id !== recruiterProfile.firm_id) {
    return { success: false, error: 'Job not found or access denied' }
  }

  const { error } = await supabaseAdmin
    .from('job_listings')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating job status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/jobs')
  revalidatePath(`/recruiter/jobs/${id}`)
  revalidatePath('/candidate/jobs')
  return { success: true }
}

export async function deleteJobListing(id: string): Promise<{ success: boolean; error?: string }> {
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

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) {
    return { success: false, error: 'Recruiter profile not found' }
  }

  // Verify job belongs to recruiter's firm and is draft
  const { data: existingJob } = await supabaseAdmin
    .from('job_listings')
    .select('id, firm_id, status')
    .eq('id', id)
    .single()

  if (!existingJob || existingJob.firm_id !== recruiterProfile.firm_id) {
    return { success: false, error: 'Job not found or access denied' }
  }

  if (existingJob.status !== 'draft') {
    return { success: false, error: 'Only draft jobs can be deleted' }
  }

  const { error } = await supabaseAdmin
    .from('job_listings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting job listing:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/recruiter/jobs')
  return { success: true }
}

export async function getJobApplications(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) return []

  // Verify job belongs to recruiter's firm
  const { data: job } = await supabaseAdmin
    .from('job_listings')
    .select('id, firm_id')
    .eq('id', jobId)
    .single()

  if (!job || job.firm_id !== recruiterProfile.firm_id) return []

  // Get applications for this job
  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      cover_letter,
      snapshot,
      candidate_profile_id,
      candidate_profiles (
        id,
        school_name,
        major,
        gpa,
        graduation_year,
        profiles!user_id (
          full_name,
          email
        )
      )
    `)
    .eq('job_listing_id', jobId)
    .order('applied_at', { ascending: false })

  return applications || []
}

export async function updateApplicationStatus(
  applicationId: string,
  status: Database['public']['Enums']['application_status']
): Promise<{ success: boolean; error?: string }> {
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

  // Get recruiter profile
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) {
    return { success: false, error: 'Recruiter profile not found' }
  }

  // Get application and verify access
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('id, job_listing_id, job_listings!job_listing_id(firm_id)')
    .eq('id', applicationId)
    .single()

  if (!application?.job_listings || (application.job_listings as any).firm_id !== recruiterProfile.firm_id) {
    return { success: false, error: 'Application not found or access denied' }
  }

  const { error } = await supabaseAdmin
    .from('applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', applicationId)

  if (error) {
    console.error('Error updating application status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/recruiter/jobs/${application.job_listing_id}`)
  return { success: true }
}
