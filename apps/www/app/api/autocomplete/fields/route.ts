import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

// Map field names to their database column names
const ALLOWED_FIELDS = {
  target_roles: 'target_roles',
  preferred_locations: 'preferred_locations',
  tags: 'tags',
} as const

type AllowedField = keyof typeof ALLOWED_FIELDS

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.toLowerCase() || ''
  const field = searchParams.get('field') as AllowedField | null

  // Validate field parameter
  if (!field || !ALLOWED_FIELDS[field]) {
    return NextResponse.json(
      { error: 'Invalid or missing field parameter', values: [] },
      { status: 400 }
    )
  }

  if (query.length < 1) {
    return NextResponse.json({ values: [] })
  }

  // Use service role to bypass RLS
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const columnName = ALLOWED_FIELDS[field]

  // Query candidate profiles and extract values client-side
  const { data: candidates } = await supabaseAdmin
    .from('candidate_profiles')
    .select(columnName)
    .limit(200)

  if (!candidates) {
    return NextResponse.json({ values: [] })
  }

  // Extract and deduplicate values from all candidate profiles
  const allValues = new Set<string>()

  candidates.forEach((candidate: any) => {
    const fieldValues = candidate[columnName]
    if (Array.isArray(fieldValues)) {
      fieldValues.forEach((value: string) => {
        if (value && value.toLowerCase().includes(query)) {
          allValues.add(value)
        }
      })
    }
  })

  // Sort alphabetically and limit
  const sortedValues = Array.from(allValues)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .slice(0, 10)

  return NextResponse.json({ values: sortedValues })
}
