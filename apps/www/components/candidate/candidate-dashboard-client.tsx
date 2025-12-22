'use client'

import { useDemoData, shouldShowDemoData } from '@/hooks/use-demo-data'
import { DemoDataBanner, DemoBadge } from '@/components/demo-data-banner'
import { DemoEmptyState } from '@/components/demo-empty-state'
import { candidateDemoData } from '@/lib/demo-data'
import { Building2, Eye, TrendingUp, Calendar, Clock, Heart, Gift } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RealDataProps {
  /** Whether the user has any real profile views */
  hasProfileViews: boolean
  /** Whether the user has any real deadlines */
  hasDeadlines: boolean
  /** Whether the user has any real firm interests */
  hasFirmInterests: boolean
  /** Whether the user has any real referrals */
  hasReferrals: boolean
  /** The actual profile viewers component (server-rendered) */
  profileViewersComponent: React.ReactNode
  /** The actual deadlines component */
  deadlinesComponent: React.ReactNode
  /** The actual firm interests component */
  firmInterestsComponent: React.ReactNode
  /** The actual referrals component */
  referralsComponent: React.ReactNode
}

export function CandidateDashboardClient({
  hasProfileViews,
  hasDeadlines,
  hasFirmInterests,
  hasReferrals,
  profileViewersComponent,
  deadlinesComponent,
  firmInterestsComponent,
  referralsComponent,
}: RealDataProps) {
  const { dismissed, isHydrated, dismiss, restore } = useDemoData('candidate')

  // Check if there's any real data across all sections
  const hasAnyRealData = hasProfileViews || hasDeadlines || hasFirmInterests || hasReferrals
  const showDemoData = shouldShowDemoData(dismissed, hasAnyRealData)

  // Wait for hydration to avoid flash
  if (!isHydrated) {
    return null
  }

  // Show empty state if demo is dismissed and no real data
  if (!hasAnyRealData && !showDemoData) {
    return (
      <DemoEmptyState
        icon={<Eye className="h-8 w-8 text-neutral-400" />}
        title="No Activity Yet"
        description="Your dashboard will populate once recruiters start viewing your profile and you interact with the platform."
        onRestore={restore}
      />
    )
  }

  // Show demo data
  if (showDemoData) {
    return (
      <div className="space-y-6">
        <DemoDataBanner
          title="Sample Data"
          description="This is example data showing what your dashboard looks like with activity. Real data will appear automatically."
          onDismiss={dismiss}
        />

        {/* Demo Profile Viewers */}
        <DemoProfileViewers />

        {/* Demo Upcoming Deadlines */}
        <DemoUpcomingDeadlines />

        {/* Demo Firm Interests */}
        <DemoFirmInterests />

        {/* Demo Referrals */}
        <DemoReferrals />
      </div>
    )
  }

  // Show real data (each component renders independently)
  return (
    <div className="space-y-6">
      {profileViewersComponent}
      {deadlinesComponent}
      {firmInterestsComponent}
      {referralsComponent}
    </div>
  )
}

// ============================================
// DEMO COMPONENTS (read-only with badges)
// ============================================

function DemoProfileViewers() {
  const { profileViewers } = candidateDemoData

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Who's Viewing Your Profile</h2>
          <DemoBadge />
        </div>
        <div className="flex items-center gap-1 text-sm text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span>{profileViewers.weeklyViews} this week</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-3 gap-4 border-b pb-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{profileViewers.totalViews}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Views</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{profileViewers.monthlyViews}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">This Month</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{profileViewers.uniqueFirms}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Unique Firms</p>
        </div>
      </div>

      {/* Firm List */}
      <div className="mt-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Firms interested in you
        </p>
        {profileViewers.viewers.map((viewer) => (
          <div
            key={viewer.firm}
            className="flex items-center justify-between rounded-lg border bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">{viewer.firm}</p>
                <p className="text-xs text-neutral-500">{viewer.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{viewer.views}</p>
              <p className="text-xs text-neutral-500">
                {viewer.views === 1 ? 'view' : 'views'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoUpcomingDeadlines() {
  const { upcomingDeadlines } = candidateDemoData

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return { text: 'Today', urgent: true }
    if (diffDays === 1) return { text: 'Tomorrow', urgent: true }
    if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true }
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: false }
    return {
      text: deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      urgent: false,
    }
  }

  const jobTypeLabels: Record<string, string> = {
    full_time: 'Full Time',
    internship: 'Internship',
    summer_analyst: 'Summer Analyst',
    off_cycle: 'Off-Cycle',
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-neutral-500" />
            Upcoming Deadlines
          </h2>
          <DemoBadge />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {upcomingDeadlines.slice(0, 4).map((deadline) => {
          const { text, urgent } = formatDeadline(deadline.application_deadline)
          return (
            <div
              key={deadline.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Building2 className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{deadline.title}</span>
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {jobTypeLabels[deadline.job_type] || deadline.job_type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {deadline.firm_name} • {deadline.locations[0]}
                    {deadline.locations.length > 1 && ` +${deadline.locations.length - 1}`}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  urgent
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {text}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DemoFirmInterests() {
  const { firmInterests } = candidateDemoData

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/20">
          <Heart className="h-5 w-5 text-pink-600" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Interested Firms</h2>
          <DemoBadge />
        </div>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Let recruiters know you're interested in their firm
      </p>

      <div className="flex flex-wrap gap-2">
        {firmInterests.map((interest) => (
          <div
            key={interest.id}
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800"
          >
            <Building2 className="h-3.5 w-3.5 text-pink-600" />
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
              {interest.firm_name}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        {10 - firmInterests.length} slots remaining
      </p>

      <div className="mt-4 rounded-lg bg-pink-50 p-3 dark:bg-pink-900/10">
        <p className="text-xs text-pink-800 dark:text-pink-200">
          <strong>How it works:</strong> When you express interest in a firm, recruiters from
          that firm will see a special badge on your profile.
        </p>
      </div>
    </div>
  )
}

function DemoReferrals() {
  const { referrals } = candidateDemoData
  const { stats, list } = referrals

  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    signed_up: {
      label: 'Signed Up',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    verified: {
      label: 'Verified',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
          <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Invite Classmates</h2>
          <DemoBadge />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Pending</div>
        </div>
        <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
          <div className="text-2xl font-bold text-blue-600">{stats.signed_up}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Signed Up</div>
        </div>
        <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
          <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Verified</div>
        </div>
      </div>

      {/* Demo Referral Link */}
      <div className="mb-6">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
          Your referral link
        </label>
        <div className="flex gap-2">
          <input
            value="https://coastalhaven.com/signup?ref=DEMO123"
            readOnly
            className="flex-1 rounded-md border bg-neutral-50 px-3 py-2 font-mono text-sm dark:bg-neutral-800/50"
          />
          <Button variant="outline" size="icon" disabled>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Referral List */}
      <div>
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Your Referrals ({list.length})
        </h3>
        <div className="space-y-2">
          {list.map((referral) => {
            const config = statusConfig[referral.status]
            return (
              <div
                key={referral.id}
                className="flex items-center justify-between rounded-lg border p-3 dark:border-neutral-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bg}`}
                  >
                    <Eye className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {referral.referred_user?.full_name || referral.referred_email}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
