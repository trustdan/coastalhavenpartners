'use server'

import { createClient } from '@/lib/supabase/server'

export async function createSchoolProfile(data: {
  userId: string
  email: string
  fullName: string
  schoolName: string
  schoolDomain: string
  departmentName: string
  contactEmail: string
}) {
  const supabase = await createClient()

  // Update profile table with role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'school_admin' })
    .eq('id', data.userId)

  if (profileError) throw profileError

  // Create school profile
  const { error: schoolError } = await supabase.from('school_profiles').insert({
    user_id: data.userId,
    school_name: data.schoolName,
    school_domain: data.schoolDomain,
    department_name: data.departmentName,
    contact_email: data.contactEmail,
  })

  if (schoolError) throw schoolError

  return { success: true }
}
