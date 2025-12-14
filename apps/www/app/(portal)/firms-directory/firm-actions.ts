'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { unstable_noStore as noStore } from 'next/cache'

// DEBUG flag - set to false to disable console logging
const DEBUG_ENABLED = true

function debugLog(label: string, data?: unknown) {
  if (DEBUG_ENABLED) {
    console.log(`[FirmActions] ${label}`, data !== undefined ? JSON.stringify(data, null, 2) : '')
  }
}

export async function saveFirm(firmId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('saved_firms')
    .insert({
      user_id: user.id,
      firm_id: firmId,
    })

  if (error) {
    // Ignore duplicate errors (already saved)
    if (error.code !== '23505') {
      console.error('Error saving firm:', error)
      throw new Error('Failed to save firm')
    }
  }

  revalidatePath('/firms')
}

export async function unsaveFirm(firmId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('saved_firms')
    .delete()
    .eq('user_id', user.id)
    .eq('firm_id', firmId)

  if (error) {
    console.error('Error unsaving firm:', error)
    throw new Error('Failed to unsave firm')
  }

  revalidatePath('/firms')
}

export async function getSavedFirms() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data: savedFirms } = await supabase
    .from('saved_firms')
    .select(`
      firm_id,
      created_at,
      firms (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return savedFirms || []
}

export interface LoadMoreFirmsParams {
  offset: number
  limit?: number
  category?: string
  region?: string
  state?: string
  priority?: number
  search?: string
  sortBy?: string
  sortOrder?: string
}

export async function loadMoreFirms(params: LoadMoreFirmsParams) {
  // Prevent caching
  noStore()

  debugLog('=== loadMoreFirms SERVER ACTION CALLED ===')
  debugLog('Received params:', params)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    debugLog('ERROR: Not authenticated')
    throw new Error('Not authenticated')
  }

  const {
    offset,
    limit = 25,
    category,
    region,
    state,
    priority,
    search,
    sortBy = 'priority',
    sortOrder = 'asc',
  } = params

  debugLog('Parsed params:', {
    offset,
    limit,
    category: category || '(none)',
    region: region || '(none)',
    state: state || '(none)',
    priority: priority || '(none)',
    search: search || '(none)',
    sortBy,
    sortOrder,
  })

  // Build query
  let query = supabase
    .from('firms')
    .select('*', { count: 'exact' })
    .eq('is_visible', true)

  // Apply filters
  if (category) {
    debugLog(`Applying filter: firm_type = ${category}`)
    query = query.eq('firm_type', category)
  }
  if (region) {
    debugLog(`Applying filter: region = ${region}`)
    query = query.eq('region', region)
  }
  if (state) {
    debugLog(`Applying filter: state = ${state}`)
    query = query.eq('state', state)
  }
  if (priority) {
    debugLog(`Applying filter: priority = ${priority}`)
    query = query.eq('priority', priority)
  }
  if (search) {
    debugLog(`Applying search: ${search}`)
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,focus_sector.ilike.%${search}%`)
  }

  // Apply sorting
  const ascending = sortOrder !== 'desc'
  debugLog(`Applying sort: ${sortBy} ${ascending ? 'ASC' : 'DESC'}`)
  query = query.order(sortBy, { ascending, nullsFirst: false })

  if (sortBy !== 'name') {
    query = query.order('name', { ascending: true })
  }

  // Apply pagination
  const from = offset
  const to = offset + limit - 1
  debugLog(`Applying range: ${from} to ${to}`)
  query = query.range(from, to)

  const { data: firms, count, error } = await query

  if (error) {
    debugLog('ERROR from Supabase:', error)
    console.error('Error loading more firms:', error)
    throw new Error('Failed to load more firms')
  }

  const hasMore = (offset + limit) < (count || 0)

  debugLog('Query results:', {
    firmsReturned: firms?.length || 0,
    totalCount: count,
    hasMore,
    calculatedHasMore: `(${offset} + ${limit}) < ${count} = ${hasMore}`,
  })

  if (firms?.length) {
    debugLog('First firm in result:', firms[0]?.name)
    debugLog('Last firm in result:', firms[firms.length - 1]?.name)
  }

  debugLog('=== loadMoreFirms COMPLETED ===')

  return {
    firms: firms || [],
    totalCount: count || 0,
    hasMore,
  }
}
