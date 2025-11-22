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
  firmName: string
  firmType: string
  jobTitle: string
}) {
  const { error } = await supabaseAdmin
    .from('recruiter_profiles')
    .insert({
      user_id: data.userId,
      firm_name: data.firmName,
      firm_type: data.firmType,
      job_title: data.jobTitle,
      is_approved: false, // Requires admin approval
    })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}
