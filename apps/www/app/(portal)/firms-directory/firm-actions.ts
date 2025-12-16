'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { unstable_noStore as noStore } from 'next/cache'
import { buildFirmsQuery } from './firm-queries'
import {
  type ServerResult,
  type FailureKind,
  success,
  failure,
  getFailureKindFromError,
} from '@/lib/utils/server-result'
import type { Database } from '@/lib/types/database.types'

type Firm = Database['public']['Tables']['firms']['Row']

// DEBUG flag - controlled by environment
// Set NEXT_PUBLIC_DEBUG=true in .env.local to enable debug logging
const DEBUG_ENABLED = process.env.NODE_ENV === 'development'
  || process.env.NEXT_PUBLIC_DEBUG === 'true'

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

/** Successful response data from loadMoreFirms */
export interface LoadMoreFirmsData {
  firms: Firm[]
  totalCount: number
  hasMore: boolean
}

// Firm type imported from Database types above

/**
 * Load more firms with pagination and filters.
 *
 * Returns a structured result that distinguishes between:
 * - Success with firms data
 * - Auth errors (user not logged in)
 * - Permission errors (RLS violations)
 * - Network/server errors
 *
 * This prevents silent failures where server errors look like empty results.
 */
export async function loadMoreFirms(
  params: LoadMoreFirmsParams
): Promise<ServerResult<LoadMoreFirmsData>> {
  // Prevent caching
  noStore()

  debugLog('=== loadMoreFirms SERVER ACTION CALLED ===')
  debugLog('Received params:', params)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    debugLog('ERROR: Not authenticated')
    return failure('auth', 'Please sign in to view firms')
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

  // Build query using shared helper (single source of truth for filter logic)
  const query = buildFirmsQuery(supabase, {
    category,
    region,
    state,
    priority,
    search,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
  })

  // Apply pagination
  const from = offset
  const to = offset + limit - 1
  debugLog(`Applying range: ${from} to ${to}`)

  const { data: firms, count, error } = await query.range(from, to)

  if (error) {
    debugLog('ERROR from Supabase:', error)
    console.error('Error loading more firms:', error)
    const errorKind = getFailureKindFromError(error)
    return failure(errorKind, 'Failed to load firms', error)
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

  return success({
    firms: (firms || []) as Firm[],
    totalCount: count || 0,
    hasMore,
  })
}
