'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export async function completeOAuthRecruiterProfile(data: {
  userId: string
  email: string
  fullName: string
  firmName: string
  firmType: string
  jobTitle: string
  linkedinUrl?: string
}) {
  console.log('Completing OAuth recruiter profile for:', data.userId)

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

  // 1. Create or update the base profile with role
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: data.userId,
      email: data.email,
      full_name: data.fullName,
      role: 'recruiter',
      linkedin_url: data.linkedinUrl || null
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('Error creating base profile:', profileError)
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  // 2. Insert Recruiter Profile
  const { error } = await supabaseAdmin
    .from('recruiter_profiles')
    .insert({
      user_id: data.userId,
      firm_name: data.firmName,
      firm_type: data.firmType,
      job_title: data.jobTitle,
      is_approved: false,
    })

  if (error) {
    console.error('Recruiter profile insert error:', error)
    throw new Error(`Failed to create recruiter profile: ${error.message}`)
  }

  console.log('OAuth recruiter profile completed successfully')
  return { success: true }
}
