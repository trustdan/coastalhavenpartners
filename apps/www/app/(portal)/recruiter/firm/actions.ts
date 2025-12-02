'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMyFirm() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.firm_id) return null

  const { data: firm } = await supabase
    .from('firms')
    .select('*')
    .eq('id', recruiterProfile.firm_id)
    .single()

  return firm
}

export async function updateFirmProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get the recruiter's firm
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('firm_id, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    throw new Error('Recruiter not approved')
  }

  if (!recruiterProfile.firm_id) {
    throw new Error('No firm associated with this recruiter')
  }

  // Parse array fields
  const locationsStr = formData.get('locations') as string
  const locations = locationsStr
    ? locationsStr.split(',').map(s => s.trim()).filter(Boolean)
    : null

  const hiringRolesStr = formData.get('hiringRoles') as string
  const hiringRoles = hiringRolesStr
    ? hiringRolesStr.split(',').map(s => s.trim()).filter(Boolean)
    : null

  const foundedYearStr = formData.get('foundedYear') as string
  const foundedYear = foundedYearStr ? parseInt(foundedYearStr) : null

  const updates = {
    description: formData.get('description') as string || null,
    culture: formData.get('culture') as string || null,
    website: formData.get('website') as string || null,
    logo_url: formData.get('logoUrl') as string || null,
    locations,
    firm_type: formData.get('firmType') as string || null,
    hiring_roles: hiringRoles,
    employee_count: formData.get('employeeCount') as string || null,
    founded_year: foundedYear,
    is_visible: formData.get('isVisible') === 'true',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('firms')
    .update(updates)
    .eq('id', recruiterProfile.firm_id)

  if (error) throw error

  revalidatePath('/recruiter/firm')
  revalidatePath('/firms')

  return { success: true }
}

export async function createFirmForRecruiter() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get recruiter profile
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id, firm_name, firm_type, company_website, locations, firm_id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) throw new Error('Recruiter profile not found')

  // If already has a firm, return
  if (recruiterProfile.firm_id) {
    return { firmId: recruiterProfile.firm_id }
  }

  // Generate a slug
  const baseSlug = recruiterProfile.firm_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Check for slug uniqueness
  let slug = baseSlug
  let counter = 0
  while (true) {
    const { data: existing } = await supabase
      .from('firms')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!existing) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // Create the firm
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .insert({
      name: recruiterProfile.firm_name,
      slug,
      website: recruiterProfile.company_website,
      locations: recruiterProfile.locations,
      firm_type: recruiterProfile.firm_type,
      is_visible: true,
    })
    .select()
    .single()

  if (firmError) throw firmError

  // Link recruiter to firm
  const { error: updateError } = await supabase
    .from('recruiter_profiles')
    .update({ firm_id: firm.id })
    .eq('id', recruiterProfile.id)

  if (updateError) throw updateError

  revalidatePath('/recruiter/firm')
  return { firmId: firm.id }
}
