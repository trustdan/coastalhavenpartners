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

export async function createCandidateProfile(data: {
  userId: string
  schoolName: string
  major: string
  gpa: number
  graduationYear: number
}) {
  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .insert({
      user_id: data.userId,
      school_name: data.schoolName,
      major: data.major,
      gpa: data.gpa,
      graduation_year: data.graduationYear,
      status: 'pending_verification',
    })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}
