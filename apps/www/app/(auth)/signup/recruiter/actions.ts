'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

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

export async function createRecruiterProfile(data: {
  userId: string
  email: string
  fullName: string
  firmName: string
  firmType: string
  jobTitle: string
}) {
  console.log('Creating recruiter profile for:', data.userId)

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
      console.log('Profile found via select')
      break
    }
    console.log(`Profile not found, attempt ${i+1}...`)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // If not found, FORCE create it using provided data
  if (!profileExists) {
    console.log('Force creating profile...')
    
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: data.userId,
        email: data.email,
        full_name: data.fullName,
        role: 'recruiter'
      }, { onConflict: 'id' })
    
    if (insertError) {
      console.error('Error creating profile:', insertError)
    } else {
      console.log('Profile created successfully')
    }
  }

  // 2. Insert Recruiter Profile
  console.log('Inserting recruiter profile...')
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
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  // 3. Admin Notification REMOVED - Replaced by Daily Digest Cron Job
  // See apps/www/app/api/cron/daily-digest/route.ts

  return { success: true }
}
