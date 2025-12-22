'use client'

import { useDemoData, shouldShowDemoData } from '@/hooks/use-demo-data'
import { DemoDataBanner, DemoBadge } from '@/components/demo-data-banner'
import { DemoEmptyState } from '@/components/demo-empty-state'
import { recruiterDemoData } from '@/lib/demo-data'
import { Users, Sparkles, Star, GraduationCap, TrendingUp, Building2 } from 'lucide-react'
import Link from 'next/link'

interface RealDataProps {
  /** Whether the recruiter has any candidates to view */
  hasCandidates: boolean
  /** The actual header component (server-rendered) */
  headerComponent: React.ReactNode
  /** The actual recommendations component */
  recommendationsComponent: React.ReactNode
  /** The actual filters component */
  filtersComponent: React.ReactNode
  /** The actual candidate table component */
  candidateTableComponent: React.ReactNode
}

export function RecruiterDashboardClient({
  hasCandidates,
  headerComponent,
  recommendationsComponent,
  filtersComponent,
  candidateTableComponent,
}: RealDataProps) {
  const { dismissed, isHydrated, dismiss, restore } = useDemoData('recruiter')

  const showDemoData = shouldShowDemoData(dismissed, hasCandidates)

  // Wait for hydration to avoid flash
  if (!isHydrated) {
    return null
  }

  // Show empty state if demo is dismissed and no real data
  if (!hasCandidates && !showDemoData) {
    return (
      <DemoEmptyState
        icon={<Users className="h-8 w-8 text-neutral-400" />}
        title="No Candidates Yet"
        description="The candidate pool will populate once verified candidates join the platform."
        onRestore={restore}
      />
    )
  }

  // Show demo data
  if (showDemoData) {
    return (
      <div className="space-y-8">
        <DemoDataBanner
          title="Sample Data"
          description="This is example data showing what your dashboard looks like with candidates. Real data will appear automatically."
          onDismiss={dismiss}
        />

        {/* Demo Stats */}
        <DemoStats />

        {/* Demo Header */}
        <DemoHeader />

        {/* Demo Recommendations */}
        <DemoRecommendedCandidates />

        {/* Demo Filters (disabled) */}
        <div className="pointer-events-none opacity-60">
          {filtersComponent}
        </div>

        {/* Demo Candidate Table */}
        <DemoCandidateTable />
      </div>
    )
  }

  // Show real data
  return (
    <div className="space-y-8">
      {headerComponent}
      {recommendationsComponent}
      {filtersComponent}
      {candidateTableComponent}
    </div>
  )
}

// ============================================
// DEMO COMPONENTS (read-only with badges)
// ============================================

function DemoStats() {
  const { stats } = recruiterDemoData

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Candidates</p>
              <DemoBadge />
            </div>
            <p className="text-2xl font-bold">{stats.totalCandidates}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
            <GraduationCap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Target Schools</p>
              <DemoBadge />
            </div>
            <p className="text-2xl font-bold">{stats.fromTargetSchools}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Match Filters</p>
              <DemoBadge />
            </div>
            <p className="text-2xl font-bold">{stats.matchingFilters}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoHeader() {
  const { candidates } = recruiterDemoData

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Candidate Pool</h1>
          <DemoBadge />
        </div>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {candidates.length} verified candidates available
        </p>
      </div>
    </div>
  )
}

function DemoRecommendedCandidates() {
  const { candidates, recommendations } = recruiterDemoData

  // Get the candidates that have recommendations
  const recommendedCandidates = recommendations.map(rec => ({
    ...candidates.find(c => c.id === rec.id)!,
    matchReason: rec.matchReason
  }))

  return (
    <div className="rounded-xl border bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-sm dark:from-purple-900/10 dark:to-blue-900/10 dark:border-purple-800/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Recommended for You</h2>
          <DemoBadge />
        </div>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Based on your saved searches and viewing history
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendedCandidates.slice(0, 3).map((candidate) => (
          <div
            key={candidate.id}
            className="rounded-lg border bg-white p-4 shadow-sm dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {candidate.matchReason}
                </span>
              </div>
            </div>
            <p className="font-semibold">{candidate.profiles.full_name}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {candidate.school_name}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              {candidate.major} • {candidate.graduation_year}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                {candidate.gpa.toFixed(2)} GPA
              </span>
              {candidate.target_roles?.[0] && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 truncate max-w-[120px]">
                  {candidate.target_roles[0]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoCandidateTable() {
  const { candidates } = recruiterDemoData

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="font-semibold">All Candidates</h3>
        <DemoBadge />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">School</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
              <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Target Roles</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Locations</th>
              <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{candidate.profiles.full_name}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {candidate.profiles.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm">{candidate.school_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{candidate.major}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    {candidate.gpa.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
                <td className="px-6 py-4">
                  {candidate.target_roles && candidate.target_roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {candidate.target_roles.slice(0, 2).map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                        >
                          {role}
                        </span>
                      ))}
                      {candidate.target_roles.length > 2 && (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          +{candidate.target_roles.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">Not specified</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {candidate.preferred_locations && candidate.preferred_locations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {candidate.preferred_locations.slice(0, 2).map((location) => (
                        <span
                          key={location}
                          className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {location}
                        </span>
                      ))}
                      {candidate.preferred_locations.length > 2 && (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          +{candidate.preferred_locations.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">Any</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <span className="text-sm text-blue-600 cursor-not-allowed opacity-50">
                      View Profile
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
