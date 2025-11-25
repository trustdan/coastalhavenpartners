import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.toLowerCase() || ''

  if (query.length < 1) {
    return NextResponse.json({ schools: [] })
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

  // Get distinct school names that match the query
  const { data: candidates } = await supabaseAdmin
    .from('candidate_profiles')
    .select('school_name')
    .ilike('school_name', `%${query}%`)
    .limit(20)

  // Also check school_profiles for registered schools
  const { data: schools } = await supabaseAdmin
    .from('school_profiles')
    .select('school_name')
    .ilike('school_name', `%${query}%`)
    .limit(20)

  // Combine and deduplicate
  const allSchools = new Set<string>()
  
  candidates?.forEach(c => {
    if (c.school_name) allSchools.add(c.school_name)
  })
  
  schools?.forEach(s => {
    if (s.school_name) allSchools.add(s.school_name)
  })

  // Sort alphabetically and limit
  const sortedSchools = Array.from(allSchools)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .slice(0, 10)

  return NextResponse.json({ schools: sortedSchools })
}

