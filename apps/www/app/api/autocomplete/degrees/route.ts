import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category') // 'undergrad' or 'graduate'

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

  // Query candidate profiles to get all unique degree types
  const column = category === 'graduate' ? 'grad_degree_type' : 'undergrad_degree_type'

  const { data: candidates } = await supabaseAdmin
    .from('candidate_profiles')
    .select(column)
    .not(column, 'is', null)
    .limit(500)

  if (!candidates) {
    return NextResponse.json({ degrees: [] })
  }

  // Extract and deduplicate degree types
  const allDegrees = new Set<string>()

  candidates.forEach((candidate: any) => {
    const degree = candidate[column]
    if (degree && typeof degree === 'string') {
      allDegrees.add(degree)
    }
  })

  // Sort alphabetically
  const sortedDegrees = Array.from(allDegrees).sort()

  return NextResponse.json({ degrees: sortedDegrees })
}
