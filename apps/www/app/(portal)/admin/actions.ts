'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveRecruiter(recruiterId: string) {
  const supabase = await createClient()

  // check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') throw new Error('Unauthorized')

  // Approve recruiter
  const { error } = await supabase
    .from('recruiter_profiles')
    .update({ 
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id
    })
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function rejectRecruiter(recruiterId: string) {
  const supabase = await createClient()

  // check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') throw new Error('Unauthorized')

  // Get the user_id associated with this recruiter profile
  const { data: recruiter } = await supabase
    .from('recruiter_profiles')
    .select('user_id')
    .eq('id', recruiterId)
    .single()

  if (!recruiter) throw new Error('Recruiter not found')

  // Delete the recruiter profile (cascade delete will handle the rest if set up, 
  // but usually we just want to delete the profile row, not the user account yet 
  // unless we want to fully wipe them. For now, let's just delete the profile row).
  // Actually, better to just delete the profile row. The user account remains but has no role profile.
  
  const { error } = await supabase
    .from('recruiter_profiles')
    .delete()
    .eq('id', recruiterId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

