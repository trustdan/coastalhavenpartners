import { createClient } from '@/lib/supabase/server'

interface RecommendedCandidate {
  id: string
  school_name: string
  major: string
  gpa: number
  graduation_year: number
  target_roles: string[] | null
  profiles: {
    full_name: string | null
    email: string
  } | null
  matchReason: string
}

export async function getRecommendedCandidates(recruiterId: string, limit = 5): Promise<RecommendedCandidate[]> {
  const supabase = await createClient()

  // Get recruiter's user_id
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('user_id')
    .eq('id', recruiterId)
    .single()

  if (!recruiterProfile?.user_id) return []

  // Get recently viewed candidates by this recruiter (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentViews } = await supabase
    .from('analytics_events')
    .select('target_id, metadata')
    .eq('user_id', recruiterProfile.user_id)
    .eq('event_type', 'profile_view')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  if (!recentViews || recentViews.length === 0) {
    // No view history - return top candidates by GPA
    const { data: topCandidates } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        school_name,
        major,
        gpa,
        graduation_year,
        target_roles,
        profiles!user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'verified')
      .order('gpa', { ascending: false })
      .limit(limit)

    return (topCandidates || []).map(c => ({
      ...c,
      profiles: c.profiles as { full_name: string | null; email: string } | null,
      matchReason: 'Top rated candidate'
    }))
  }

  // Get the user_ids of viewed candidates
  const viewedUserIds = recentViews
    .map(v => v.target_id)
    .filter((id): id is string => !!id)

  // Get profiles of viewed candidates to understand preferences
  const { data: viewedCandidates } = await supabase
    .from('candidate_profiles')
    .select('school_name, major, gpa, graduation_year')
    .in('user_id', viewedUserIds)

  if (!viewedCandidates || viewedCandidates.length === 0) {
    return []
  }

  // Extract patterns from viewed candidates
  const schools = [...new Set(viewedCandidates.map(c => c.school_name).filter(Boolean))]
  const majors = [...new Set(viewedCandidates.map(c => c.major).filter(Boolean))]
  const avgGpa = viewedCandidates.reduce((sum, c) => sum + (c.gpa || 0), 0) / viewedCandidates.length
  const minGpa = Math.max(avgGpa - 0.3, 3.0) // Find candidates within 0.3 GPA points

  // Get candidate_profile IDs for viewed candidates to exclude
  const { data: viewedCandidateProfiles } = await supabase
    .from('candidate_profiles')
    .select('id')
    .in('user_id', viewedUserIds)

  const viewedCandidateIds = viewedCandidateProfiles?.map(c => c.id) || []

  // Find similar candidates not yet viewed
  const recommendations: RecommendedCandidate[] = []

  // Priority 1: Same school, similar GPA
  if (schools.length > 0 && recommendations.length < limit) {
    const { data: sameSchool } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        school_name,
        major,
        gpa,
        graduation_year,
        target_roles,
        profiles!user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'verified')
      .in('school_name', schools)
      .gte('gpa', minGpa)
      .not('id', 'in', `(${viewedCandidateIds.length > 0 ? viewedCandidateIds.join(',') : 'null'})`)
      .order('gpa', { ascending: false })
      .limit(limit - recommendations.length)

    sameSchool?.forEach(c => {
      if (!recommendations.find(r => r.id === c.id)) {
        recommendations.push({
          ...c,
          profiles: c.profiles as { full_name: string | null; email: string } | null,
          matchReason: `From ${c.school_name} (similar to your recent views)`
        })
      }
    })
  }

  // Priority 2: Same major, similar GPA
  if (majors.length > 0 && recommendations.length < limit) {
    const { data: sameMajor } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        school_name,
        major,
        gpa,
        graduation_year,
        target_roles,
        profiles!user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'verified')
      .in('major', majors)
      .gte('gpa', minGpa)
      .not('id', 'in', `(${viewedCandidateIds.length > 0 ? viewedCandidateIds.join(',') : 'null'})`)
      .order('gpa', { ascending: false })
      .limit(limit - recommendations.length)

    sameMajor?.forEach(c => {
      if (!recommendations.find(r => r.id === c.id)) {
        recommendations.push({
          ...c,
          profiles: c.profiles as { full_name: string | null; email: string } | null,
          matchReason: `${c.major} major (matches your preferences)`
        })
      }
    })
  }

  // Priority 3: Similar GPA if we still need more
  if (recommendations.length < limit) {
    const { data: similarGpa } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        school_name,
        major,
        gpa,
        graduation_year,
        target_roles,
        profiles!user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'verified')
      .gte('gpa', minGpa)
      .not('id', 'in', `(${viewedCandidateIds.length > 0 ? viewedCandidateIds.join(',') : 'null'})`)
      .order('gpa', { ascending: false })
      .limit(limit - recommendations.length)

    similarGpa?.forEach(c => {
      if (!recommendations.find(r => r.id === c.id)) {
        recommendations.push({
          ...c,
          profiles: c.profiles as { full_name: string | null; email: string } | null,
          matchReason: `High achiever (${c.gpa.toFixed(2)} GPA)`
        })
      }
    })
  }

  return recommendations.slice(0, limit)
}
