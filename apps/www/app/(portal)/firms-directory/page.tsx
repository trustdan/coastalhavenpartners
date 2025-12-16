import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { FirmsFilters } from './firms-filters'
import { FirmsTable } from './firms-table'
import { ColumnSelector } from './column-selector'
import { OPTIONAL_COLUMNS, type OptionalColumnKey } from '@/lib/constants/firms'
import { buildFirmsQuery, parseFiltersFromParams } from './firm-queries'
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
// Set NEXT_PUBLIC_DEBUG=true in .env.local to enable debug logging
const DEBUG_ENABLED = process.env.NODE_ENV === 'development'
  || process.env.NEXT_PUBLIC_DEBUG === 'true'
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

  // Parse filter params using shared helper
  const { category, region, state, priority, search, sortBy, sortOrder, page, limit } =
    parseFiltersFromParams(params)

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

  // Build query using shared helper (single source of truth for filter logic)
  const query = buildFirmsQuery(supabase, { category, region, state, priority, search, sortBy, sortOrder })

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: firms, count, error } = await query.range(from, to)

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
