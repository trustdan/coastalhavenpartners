import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify user is authenticated and is an approved recruiter
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('is_approved, firm_name')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    return NextResponse.json({ error: 'Recruiter not approved' }, { status: 403 })
  }

  // Parse query parameters for filters
  const searchParams = request.nextUrl.searchParams
  const gpa = searchParams.get('gpa')
  const major = searchParams.get('major')
  const school = searchParams.get('school')
  const gradYear = searchParams.get('gradYear')
  const targetRole = searchParams.get('targetRole')
  const undergradDegree = searchParams.get('undergradDegree')
  const gradDegree = searchParams.get('gradDegree')

  // Build query
  let query = supabase
    .from('candidate_profiles')
    .select(`
      id,
      school_name,
      major,
      gpa,
      graduation_year,
      target_roles,
      preferred_locations,
      undergrad_degree_type,
      grad_degree_type,
      profiles!user_id (
        full_name,
        email,
        linkedin_url
      )
    `)
    .eq('status', 'verified')

  if (gpa) {
    query = query.gte('gpa', parseFloat(gpa))
  }
  if (major) {
    query = query.ilike('major', `%${major}%`)
  }
  if (school) {
    query = query.ilike('school_name', `%${school}%`)
  }
  if (gradYear) {
    query = query.eq('graduation_year', parseInt(gradYear))
  }
  if (targetRole) {
    query = query.contains('target_roles', [targetRole])
  }
  if (undergradDegree) {
    query = query.eq('undergrad_degree_type', undergradDegree)
  }
  if (gradDegree) {
    query = query.eq('grad_degree_type', gradDegree)
  }

  const { data: candidates, error } = await query.order('gpa', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log export (can add analytics tracking later if needed)
  console.log('CSV export by recruiter:', recruiterProfile.firm_name, 'Count:', candidates?.length || 0)

  // Generate CSV
  const headers = ['Name', 'Email', 'School', 'Major', 'GPA', 'Grad Year', 'LinkedIn', 'Target Roles', 'Preferred Locations']

  const rows = (candidates || []).map(candidate => [
    candidate.profiles?.full_name || '',
    candidate.profiles?.email || '',
    candidate.school_name || '',
    candidate.major || '',
    candidate.gpa?.toFixed(2) || '',
    candidate.graduation_year?.toString() || '',
    candidate.profiles?.linkedin_url || '',
    (candidate.target_roles || []).join('; '),
    (candidate.preferred_locations || []).join('; ')
  ])

  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n')

  // Return as downloadable CSV file
  const filename = `candidates-export-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
