'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export async function completeOAuthCandidateProfile(data: {
  userId: string
  email: string
  fullName: string
  schoolName: string
  major: string
  gpa: number
  graduationYear: number
  linkedinUrl?: string
}) {
  console.log('Completing OAuth candidate profile for:', data.userId)

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
      role: 'candidate',
      linkedin_url: data.linkedinUrl || null
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('Error creating base profile:', profileError)
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  // 2. Insert Candidate Profile
  const { data: candidateProfile, error } = await supabaseAdmin
    .from('candidate_profiles')
    .insert({
      user_id: data.userId,
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

  console.log('OAuth candidate profile completed successfully:', candidateProfile.id)
  return { success: true }
}
