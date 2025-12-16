import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export interface FirmFilters {
  category?: string
  region?: string
  state?: string
  priority?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Build a Supabase query for firms with filters applied.
 * This is the SINGLE SOURCE OF TRUTH for firm filtering logic.
 * Used by both page.tsx (initial load) and firm-actions.ts (load more).
 *
 * @param supabase - Supabase client instance
 * @param filters - Filter parameters
 * @returns Supabase query builder (call .range() to paginate, then await)
 */
export function buildFirmsQuery(
  supabase: SupabaseClient<Database>,
  filters: FirmFilters
) {
  let query = supabase
    .from('firms')
    .select('*', { count: 'exact' })
    .eq('is_visible', true)

  // Apply filters
  if (filters.category) {
    query = query.eq('firm_type', filters.category)
  }
  if (filters.region) {
    query = query.eq('region', filters.region)
  }
  if (filters.state) {
    query = query.eq('state', filters.state)
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,focus_sector.ilike.%${filters.search}%`
    )
  }

  // Apply sorting
  const ascending = filters.sortOrder !== 'desc'
  const sortBy = filters.sortBy || 'priority'
  query = query.order(sortBy, { ascending, nullsFirst: false })

  // Add secondary sort by name for consistency (unless already sorting by name)
  if (sortBy !== 'name') {
    query = query.order('name', { ascending: true })
  }

  return query
}

/**
 * Parse filter parameters from URL search params.
 * Ensures consistent parsing between server component and client.
 */
export function parseFiltersFromParams(
  params: Record<string, string | string[] | undefined>
): FirmFilters & { page: number; limit: number } {
  return {
    category: typeof params.category === 'string' ? params.category : undefined,
    region: typeof params.region === 'string' ? params.region : undefined,
    state: typeof params.state === 'string' ? params.state : undefined,
    priority: typeof params.priority === 'string' ? parseInt(params.priority) : undefined,
    search: typeof params.search === 'string' ? params.search : undefined,
    sortBy: typeof params.sort === 'string' ? params.sort : 'priority',
    sortOrder: (typeof params.order === 'string' ? params.order : 'asc') as 'asc' | 'desc',
    page: typeof params.page === 'string' ? parseInt(params.page) : 1,
    limit: 25,
  }
}
