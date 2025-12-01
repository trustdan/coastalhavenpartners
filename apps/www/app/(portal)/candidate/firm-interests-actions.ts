'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_FIRM_INTERESTS = 10

export async function getFirmInterests() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) return []

  const { data: interests } = await supabase
    .from('candidate_firm_interests')
    .select('id, firm_name, created_at')
    .eq('candidate_id', candidateProfile.id)
    .order('created_at', { ascending: false })

  return interests || []
}

export async function addFirmInterest(firmName: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) throw new Error('Candidate profile not found')

  // Check current count
  const { count } = await supabase
    .from('candidate_firm_interests')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', candidateProfile.id)

  if ((count || 0) >= MAX_FIRM_INTERESTS) {
    throw new Error(`You can only express interest in up to ${MAX_FIRM_INTERESTS} firms`)
  }

  // Normalize firm name (trim whitespace)
  const normalizedFirmName = firmName.trim()

  if (!normalizedFirmName) {
    throw new Error('Firm name is required')
  }

  const { error } = await supabase
    .from('candidate_firm_interests')
    .insert({
      candidate_id: candidateProfile.id,
      firm_name: normalizedFirmName
    })

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already expressed interest in this firm')
    }
    throw error
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/edit-profile')
  return { success: true }
}

export async function removeFirmInterest(firmInterestId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) throw new Error('Candidate profile not found')

  const { error } = await supabase
    .from('candidate_firm_interests')
    .delete()
    .eq('id', firmInterestId)
    .eq('candidate_id', candidateProfile.id)

  if (error) throw error

  revalidatePath('/candidate')
  revalidatePath('/candidate/edit-profile')
  return { success: true }
}

// Get list of known firms for autocomplete
export async function getKnownFirms(query: string) {
  const supabase = await createClient()

  if (!query || query.length < 2) return []

  // Get unique firm names from recruiter_profiles
  const { data: firms } = await supabase
    .from('recruiter_profiles')
    .select('firm_name')
    .ilike('firm_name', `%${query}%`)
    .eq('is_approved', true)
    .limit(10)

  if (!firms) return []

  // Deduplicate and return
  const uniqueFirms = [...new Set(firms.map(f => f.firm_name))]
  return uniqueFirms
}

// Check if a candidate is interested in a specific firm
export async function checkCandidateInterest(candidateId: string, firmName: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('candidate_firm_interests')
    .select('id')
    .eq('candidate_id', candidateId)
    .ilike('firm_name', firmName)
    .single()

  return !!data
}

// For recruiters: get candidates interested in their firm
export async function getCandidatesInterestedInMyFirm() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('firm_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) return []

  // Get candidate IDs interested in this firm
  const { data: interests } = await supabase
    .from('candidate_firm_interests')
    .select('candidate_id')
    .ilike('firm_name', recruiterProfile.firm_name)

  return interests?.map(i => i.candidate_id) || []
}
