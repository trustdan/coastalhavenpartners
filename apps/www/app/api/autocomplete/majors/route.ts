import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.toLowerCase() || ''

  if (query.length < 1) {
    return NextResponse.json({ majors: [] })
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

  // Get distinct majors that match the query
  const { data: candidates } = await supabaseAdmin
    .from('candidate_profiles')
    .select('major')
    .ilike('major', `%${query}%`)
    .limit(50)

  // Deduplicate
  const allMajors = new Set<string>()
  
  candidates?.forEach(c => {
    if (c.major) allMajors.add(c.major)
  })

  // Sort alphabetically and limit
  const sortedMajors = Array.from(allMajors)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .slice(0, 10)

  return NextResponse.json({ majors: sortedMajors })
}

