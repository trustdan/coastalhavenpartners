'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Json } from '@/lib/types/database.types'

export interface SearchFilters {
  gpa?: string
  major?: string
  school?: string
  gradYear?: string
  targetRole?: string
  undergradDegree?: string
  gradDegree?: string
  // Profile completion filters
  hasResume?: string
  hasTranscript?: string
  hasCalendar?: string
  hasBio?: string
  hasTargetRoles?: string
  hasLocations?: string
}

export interface SavedSearchResult {
  id: string
  name: string
  filters: SearchFilters
  notify_new_matches: boolean
  created_at: string
}

export async function getSavedSearches(): Promise<SavedSearchResult[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) return []

  const { data: searches } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('recruiter_id', recruiterProfile.id)
    .order('created_at', { ascending: false })

  // Transform to ensure proper typing
  return (searches || []).map(search => ({
    id: search.id,
    name: search.name,
    filters: (search.filters as SearchFilters) || {},
    notify_new_matches: search.notify_new_matches || false,
    created_at: search.created_at || new Date().toISOString()
  }))
}

export async function saveSearch(name: string, filters: SearchFilters) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile) throw new Error('Recruiter profile not found')

  // Clean up empty filter values
  const cleanFilters: SearchFilters = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      cleanFilters[key as keyof SearchFilters] = value
    }
  })

  const { error } = await supabase
    .from('saved_searches')
    .insert({
      recruiter_id: recruiterProfile.id,
      name,
      filters: cleanFilters as unknown as Json
    })

  if (error) throw new Error(error.message)

  revalidatePath('/recruiter')
}

export async function deleteSearch(searchId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId)

  if (error) throw new Error(error.message)

  revalidatePath('/recruiter')
}

export async function updateSearchNotification(searchId: string, notify: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('saved_searches')
    .update({ notify_new_matches: notify })
    .eq('id', searchId)

  if (error) throw new Error(error.message)

  revalidatePath('/recruiter')
}
