'use server'

import { createClient } from '@/lib/supabase/server'

export interface SchoolAnalytics {
  total_students: number
  placed_students: number
  verified_students: number
  active_students: number
  placement_rate: number
  avg_gpa: number
  avg_placed_gpa: number
}

export interface PlacementByFirmType {
  firm_type: string
  placement_count: number
}

export interface RecentPlacement {
  candidate_id: string
  candidate_name: string
  major: string
  graduation_year: number
  gpa: number
  placed_at: string
  placement_role: string | null
  placement_location: string | null
  firm_id: string
  firm_name: string
  firm_type: string
  firm_logo_url: string | null
}

export interface PlacementByYear {
  graduation_year: number
  total_students: number
  placed_students: number
  placement_rate: number
}

export async function getSchoolAnalytics(): Promise<SchoolAnalytics | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get school profile
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('school_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) return null

  // Get analytics using the function (cast to any since types not yet generated)
  const { data, error } = await (supabase as any).rpc('get_school_analytics', {
    p_school_name: schoolProfile.school_name
  })

  if (error) {
    console.error('Error fetching school analytics:', error)
    return null
  }

  return data as SchoolAnalytics
}

export async function getPlacementsByFirmType(): Promise<PlacementByFirmType[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get school profile
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('school_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) return []

  // Get placements by firm type (cast to any since types not yet generated)
  const { data, error } = await (supabase as any)
    .from('school_placements_by_firm_type')
    .select('firm_type, placement_count')
    .eq('school_name', schoolProfile.school_name)

  if (error) {
    console.error('Error fetching placements by firm type:', error)
    return []
  }

  return (data || []) as PlacementByFirmType[]
}

export async function getRecentPlacements(limit: number = 10): Promise<RecentPlacement[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get school profile
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('school_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) return []

  // Get recent placements (cast to any since types not yet generated)
  const { data, error } = await (supabase as any)
    .from('school_recent_placements')
    .select('*')
    .eq('school_name', schoolProfile.school_name)
    .limit(limit)

  if (error) {
    console.error('Error fetching recent placements:', error)
    return []
  }

  return (data || []) as RecentPlacement[]
}

export async function getPlacementsByYear(): Promise<PlacementByYear[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get school profile
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('school_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) return []

  // Get placements by year (cast to any since types not yet generated)
  const { data, error } = await (supabase as any)
    .from('school_placement_stats')
    .select('graduation_year, total_students, placed_students, placement_rate')
    .eq('school_name', schoolProfile.school_name)
    .order('graduation_year', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching placements by year:', error)
    return []
  }

  return (data || []) as PlacementByYear[]
}

export async function getStudentsByStatus(): Promise<{ status: string; count: number }[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get school profile
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('school_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) return []

  // Get students grouped by status
  const { data: candidates, error } = await supabase
    .from('candidate_profiles')
    .select('status')
    .eq('school_name', schoolProfile.school_name)
    .eq('is_rejected', false)

  if (error || !candidates) return []

  // Aggregate by status
  const statusCounts = candidates.reduce((acc, candidate) => {
    const status = candidate.status || 'pending_verification'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count: count as number
  }))
}

export async function getGpaDistribution(): Promise<{ range: string; count: number }[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get school profile
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('school_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) return []

  // Get all GPAs
  const { data: candidates, error } = await supabase
    .from('candidate_profiles')
    .select('gpa')
    .eq('school_name', schoolProfile.school_name)
    .eq('is_rejected', false)

  if (error || !candidates) return []

  // Define GPA ranges
  const ranges = [
    { range: '3.9-4.0', min: 3.9, max: 4.0 },
    { range: '3.7-3.89', min: 3.7, max: 3.89 },
    { range: '3.5-3.69', min: 3.5, max: 3.69 },
    { range: '3.3-3.49', min: 3.3, max: 3.49 },
    { range: '3.0-3.29', min: 3.0, max: 3.29 },
    { range: '<3.0', min: 0, max: 2.99 },
  ]

  const distribution = ranges.map(({ range, min, max }) => ({
    range,
    count: candidates.filter(c => c.gpa >= min && c.gpa <= max).length
  }))

  return distribution
}
