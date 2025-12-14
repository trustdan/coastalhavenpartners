import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { FirmsFilters } from './firms-filters'
import { FirmsTable } from './firms-table'
import { ColumnSelector } from './column-selector'
import { OPTIONAL_COLUMNS, type OptionalColumnKey } from '@/lib/constants/firms'
import type { Database } from '@/lib/types/database.types'

type Firm = Database['public']['Tables']['firms']['Row']

export const metadata = {
  title: 'Firms Directory | Coastal Haven Partners',
  description: 'Browse our curated directory of investment banks, private equity firms, venture capital, and more.',
}

// Force dynamic rendering to ensure server component re-renders on search param changes
export const dynamic = 'force-dynamic'
export const revalidate = 0

// DEBUG: Generate unique render ID for tracking
const DEBUG_ENABLED = true
let renderCount = 0

export default async function FirmsDirectory({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Force no caching
  noStore()

  const renderTimestamp = Date.now()
  const currentRenderCount = ++renderCount

  const supabase = await createClient()
  const params = await searchParams

  // DEBUG: Log every server component render
  if (DEBUG_ENABLED) {
    console.log('\n=== [FirmsPage] SERVER COMPONENT RENDER ===')
    console.log(`[FirmsPage] Render #${currentRenderCount} at ${new Date(renderTimestamp).toISOString()}`)
    console.log('[FirmsPage] Raw searchParams:', JSON.stringify(params, null, 2))
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Parse filter params
  const category = typeof params.category === 'string' ? params.category : undefined
  const region = typeof params.region === 'string' ? params.region : undefined
  const state = typeof params.state === 'string' ? params.state : undefined
  const priority = typeof params.priority === 'string' ? parseInt(params.priority) : undefined
  const search = typeof params.search === 'string' ? params.search : undefined
  const sortBy = typeof params.sort === 'string' ? params.sort : 'priority'
  const sortOrder = typeof params.order === 'string' ? params.order : 'asc'
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const limit = 25

  // DEBUG: Log parsed filters
  if (DEBUG_ENABLED) {
    console.log('[FirmsPage] Parsed filters:', {
      category: category || '(none - showing ALL)',
      region: region || '(none)',
      state: state || '(none)',
      priority: priority || '(none)',
      search: search || '(none)',
      sortBy,
      sortOrder,
      page,
      limit,
    })
  }

  // Parse optional columns
  const columnsParam = typeof params.columns === 'string' ? params.columns : ''
  const validColumnKeys = OPTIONAL_COLUMNS.map(c => c.key)
  const selectedColumns = columnsParam
    .split(',')
    .filter((col): col is OptionalColumnKey => validColumnKeys.includes(col as OptionalColumnKey))

  // Build query
  let query = supabase
    .from('firms')
    .select('*', { count: 'exact' })
    .eq('is_visible', true)

  // Apply filters
  if (category) {
    query = query.eq('firm_type', category)
  }
  if (region) {
    query = query.eq('region', region)
  }
  if (state) {
    query = query.eq('state', state)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,focus_sector.ilike.%${search}%`)
  }

  // Apply sorting
  const ascending = sortOrder !== 'desc'
  // Handle nulls for sorting - put nulls last
  query = query.order(sortBy, { ascending, nullsFirst: false })

  // If not sorting by name, add secondary sort by name for consistency
  if (sortBy !== 'name') {
    query = query.order('name', { ascending: true })
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data: firms, count, error } = await query

  // DEBUG: Log query results
  if (DEBUG_ENABLED) {
    console.log('[FirmsPage] Query results:', {
      firmsReturned: firms?.length ?? 0,
      totalCount: count,
      hasError: !!error,
      error: error?.message,
      pagination: { from: (page - 1) * limit, to: (page - 1) * limit + limit - 1 },
    })
    if (firms?.length) {
      console.log('[FirmsPage] First firm:', firms[0]?.name, '| Last firm:', firms[firms.length - 1]?.name)
    }
  }

  if (error) {
    console.error('Error fetching firms:', error)
  }

  // Get saved firms for this user
  const { data: savedFirms } = await supabase
    .from('saved_firms')
    .select('firm_id')
    .eq('user_id', user.id)

  const savedFirmIds = new Set((savedFirms || []).map(sf => sf.firm_id))

  const totalPages = count ? Math.ceil(count / limit) : 1

  // Create a stable key for the table that changes when filters change
  // This forces React to re-mount the component with fresh state
  const tableKey = `${category || ''}-${region || ''}-${state || ''}-${priority || ''}-${search || ''}-${sortBy}-${sortOrder}`

  // DEBUG: Final summary before render
  if (DEBUG_ENABLED) {
    console.log('[FirmsPage] Rendering with:', {
      tableKey,
      totalCount: count || 0,
      totalPages,
      firmsPassedToTable: (firms as Firm[])?.length || 0,
      hasMoreExpected: (count || 0) > ((firms as Firm[])?.length || 0),
    })
    console.log('=== [FirmsPage] END SERVER RENDER ===\n')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firms Directory</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {count || 0} firms in our network
          </p>
        </div>
        <ColumnSelector selectedColumns={selectedColumns} />
      </div>

      <FirmsFilters />

      <FirmsTable
        key={tableKey}
        firms={(firms as Firm[]) || []}
        savedFirmIds={savedFirmIds}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
        selectedColumns={selectedColumns}
      />
    </div>
  )
}
