'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database.types'

export type BookmarkStatus = Database['public']['Enums']['bookmark_status']

export async function getBookmarkStatus(candidateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isBookmarked: false, notes: null, status: null as BookmarkStatus | null }

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) return { isBookmarked: false, notes: null, status: null as BookmarkStatus | null }

  const { data: bookmark } = await supabase
    .from('bookmarked_candidates')
    .select('id, notes, status')
    .eq('recruiter_id', recruiterProfile.id)
    .eq('candidate_id', candidateId)
    .single()

  return {
    isBookmarked: !!bookmark,
    notes: bookmark?.notes || null,
    status: (bookmark?.status as BookmarkStatus) || null
  }
}

export async function toggleBookmark(candidateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) throw new Error('Recruiter profile not found')

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from('bookmarked_candidates')
    .select('id')
    .eq('recruiter_id', recruiterProfile.id)
    .eq('candidate_id', candidateId)
    .single()

  if (existing) {
    // Remove bookmark
    await supabase
      .from('bookmarked_candidates')
      .delete()
      .eq('id', existing.id)

    revalidatePath('/recruiter/saved')
    revalidatePath(`/recruiter/candidates/${candidateId}`)
    return { isBookmarked: false }
  } else {
    // Add bookmark
    await supabase
      .from('bookmarked_candidates')
      .insert({
        recruiter_id: recruiterProfile.id,
        candidate_id: candidateId
      })

    revalidatePath('/recruiter/saved')
    revalidatePath(`/recruiter/candidates/${candidateId}`)
    return { isBookmarked: true }
  }
}

export async function updateBookmarkNotes(candidateId: string, notes: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) throw new Error('Recruiter profile not found')

  await supabase
    .from('bookmarked_candidates')
    .update({ notes })
    .eq('recruiter_id', recruiterProfile.id)
    .eq('candidate_id', candidateId)

  revalidatePath('/recruiter/saved')
  revalidatePath(`/recruiter/candidates/${candidateId}`)
}

export async function updateCandidateStatus(candidateId: string, status: BookmarkStatus) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) throw new Error('Recruiter profile not found')

  const { error } = await supabase
    .from('bookmarked_candidates')
    .update({ status })
    .eq('recruiter_id', recruiterProfile.id)
    .eq('candidate_id', candidateId)

  if (error) throw error

  revalidatePath('/recruiter/saved')
  revalidatePath(`/recruiter/candidates/${candidateId}`)
  return { success: true }
}

export async function getBookmarkedCandidates() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) return []

  const { data: bookmarks } = await supabase
    .from('bookmarked_candidates')
    .select(`
      id,
      notes,
      status,
      created_at,
      candidate_id,
      candidate_profiles!candidate_id (
        id,
        school_name,
        major,
        gpa,
        graduation_year,
        target_roles,
        gpa_verified,
        profiles!user_id (
          full_name,
          email
        )
      )
    `)
    .eq('recruiter_id', recruiterProfile.id)
    .order('created_at', { ascending: false })

  return bookmarks || []
}

// ============ CANDIDATE NOTES ============

export async function getCandidateNotes(candidateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) return null

  const { data: notes } = await supabase
    .from('recruiter_candidate_notes')
    .select('content, updated_at')
    .eq('recruiter_id', recruiterProfile.id)
    .eq('candidate_id', candidateId)
    .single()

  return notes
}

export async function saveCandidateNotes(candidateId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) throw new Error('Recruiter profile not found')

  // Upsert the notes
  const { error } = await supabase
    .from('recruiter_candidate_notes')
    .upsert({
      recruiter_id: recruiterProfile.id,
      candidate_id: candidateId,
      content,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'recruiter_id,candidate_id'
    })

  if (error) throw error

  revalidatePath(`/recruiter/candidates/${candidateId}`)
  return { success: true }
}
