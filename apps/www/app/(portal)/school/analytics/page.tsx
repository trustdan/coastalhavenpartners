import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getSchoolAnalytics,
  getPlacementsByFirmType,
  getRecentPlacements,
  getPlacementsByYear,
  getStudentsByStatus,
  getGpaDistribution,
} from '../analytics-actions'
import { AnalyticsDashboard } from './analytics-dashboard'

export const metadata = {
  title: 'Placement Analytics | Coastal Haven Partners',
  description: 'View placement statistics and analytics for your students',
}

export default async function SchoolAnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get school profile
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('school_name, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!schoolProfile?.is_approved) {
    redirect('/school')
  }

  // Fetch all analytics data in parallel
  const [
    analytics,
    placementsByFirmType,
    recentPlacements,
    placementsByYear,
    studentsByStatus,
    gpaDistribution,
  ] = await Promise.all([
    getSchoolAnalytics(),
    getPlacementsByFirmType(),
    getRecentPlacements(10),
    getPlacementsByYear(),
    getStudentsByStatus(),
    getGpaDistribution(),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Placement Analytics</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Track placement outcomes and student progress at {schoolProfile.school_name}
        </p>
      </div>

      <AnalyticsDashboard
        analytics={analytics}
        placementsByFirmType={placementsByFirmType}
        recentPlacements={recentPlacements}
        placementsByYear={placementsByYear}
        studentsByStatus={studentsByStatus}
        gpaDistribution={gpaDistribution}
      />
    </div>
  )
}
