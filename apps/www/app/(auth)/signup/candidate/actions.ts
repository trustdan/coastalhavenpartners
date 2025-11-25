'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export async function createCandidateProfile(data: {
  userId: string
  email: string
  fullName: string
  schoolName: string
  major: string
  gpa: number
  graduationYear: number
  linkedinUrl?: string
}) {
  console.log('Creating candidate profile for:', data.userId)

  // Server-side only - uses service role to bypass RLS
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

  // 1. Ensure Profile Exists (Retry Logic)
  let profileExists = false
  
  // Try to find it first
  for (let i = 0; i < 3; i++) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', data.userId)
      .single()
    
    if (profile) {
      profileExists = true
      break
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // If not found, FORCE create it
  if (!profileExists) {
    console.log('Force creating candidate base profile...')
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: data.userId,
        email: data.email,
        full_name: data.fullName,
        role: 'candidate',
        linkedin_url: data.linkedinUrl || null
      }, { onConflict: 'id' })

    if (insertError) {
      console.error('Error creating base profile:', insertError)
    }
  } else if (data.linkedinUrl) {
    // Update LinkedIn URL if profile already exists
    await supabaseAdmin
      .from('profiles')
      .update({ linkedin_url: data.linkedinUrl })
      .eq('id', data.userId)
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

  console.log('Candidate profile created successfully:', candidateProfile.id)
  return { success: true }
}
