'use server'

import { createClient } from '@/lib/supabase/server'

export async function getVisibleFirms() {
  const supabase = await createClient()

  const { data: firms } = await supabase
    .from('firms')
    .select('*')
    .eq('is_visible', true)
    .order('name')

  return firms || []
}

export async function getFirmBySlug(slug: string) {
  const supabase = await createClient()

  const { data: firm } = await supabase
    .from('firms')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (!firm) return null

  // Get recruiters for this firm
  const { data: recruiters } = await supabase
    .from('recruiter_profiles')
    .select(`
      id,
      job_title,
      bio,
      linkedin_url,
      profile_photo_url,
      profiles!user_id (
        full_name
      )
    `)
    .eq('firm_id', firm.id)
    .eq('is_approved', true)
    .eq('is_visible_to_candidates', true)

  return {
    ...firm,
    recruiters: recruiters || []
  }
}

export async function getAllFirmSlugs() {
  const supabase = await createClient()

  const { data: firms } = await supabase
    .from('firms')
    .select('slug')
    .eq('is_visible', true)

  return firms?.map(f => f.slug) || []
}
