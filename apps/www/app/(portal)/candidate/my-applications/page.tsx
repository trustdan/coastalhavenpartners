import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Clock, CheckCircle2, XCircle, MessageSquare, Users, ChevronRight } from 'lucide-react'
import { getMyApplications, getCandidateProfile } from '../jobs/actions'
import { WithdrawButton } from './withdraw-button'
import type { Database } from '@/lib/types/database.types'

type ApplicationStatus = Database['public']['Enums']['application_status']
type JobType = Database['public']['Enums']['job_type']

const jobTypeLabels: Record<JobType, string> = {
  full_time: 'Full Time',
  internship: 'Internship',
  summer_analyst: 'Summer Analyst',
  off_cycle: 'Off-Cycle',
}

const statusConfig: Record<ApplicationStatus, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  reviewing: {
    label: 'Under Review',
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  interviewed: {
    label: 'Interviewed',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  rejected: {
    label: 'Not Selected',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
  withdrawn: {
    label: 'Withdrawn',
    icon: XCircle,
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100 dark:bg-neutral-800',
  },
}

export default async function MyApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const candidateProfile = await getCandidateProfile()

  if (!candidateProfile) {
    redirect('/candidate')
  }

  const applications = await getMyApplications()

  const activeApplications = applications.filter(
    (app: any) => !['withdrawn', 'rejected'].includes(app.status)
  )
  const pastApplications = applications.filter((app: any) =>
    ['withdrawn', 'rejected'].includes(app.status)
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Track the status of your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <Briefcase className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-xl font-semibold">No applications yet</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Start browsing jobs and apply to positions that interest you.
          </p>
          <Link
            href="/candidate/jobs"
            className="mt-4 inline-flex items-center text-blue-600 hover:underline"
          >
            Browse Jobs
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Active Applications */}
          {activeApplications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Active Applications ({activeApplications.length})
              </h2>
              {activeApplications.map((app: any) => {
                const job = app.job_listings
                const status = statusConfig[app.status as ApplicationStatus]
                const StatusIcon = status.icon

                return (
                  <div
                    key={app.id}
                    className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900"
                  >
                    <div className="flex items-start gap-4">
                      {/* Firm Logo */}
                      <div className="flex-shrink-0">
                        {job?.firm?.logo_url ? (
                          <img
                            src={job.firm.logo_url}
                            alt={`${job.firm.name} logo`}
                            className="h-12 w-12 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-1.5"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <span className="text-lg font-bold">
                              {job?.firm?.name?.charAt(0).toUpperCase() || 'J'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/candidate/jobs/${job?.slug}`}
                              className="text-lg font-semibold hover:text-blue-600 hover:underline"
                            >
                              {job?.title}
                            </Link>
                            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                              {job?.firm?.name}
                            </p>
                          </div>

                          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {status.label}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>{jobTypeLabels[job?.job_type as JobType]}</span>
                          <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {app.status === 'pending' && (
                      <div className="mt-4 flex justify-end">
                        <WithdrawButton applicationId={app.id} jobTitle={job?.title} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Past Applications */}
          {pastApplications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                Past Applications ({pastApplications.length})
              </h2>
              {pastApplications.map((app: any) => {
                const job = app.job_listings
                const status = statusConfig[app.status as ApplicationStatus]
                const StatusIcon = status.icon

                return (
                  <div
                    key={app.id}
                    className="rounded-xl border bg-white/50 p-6 shadow-sm dark:bg-neutral-900/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {job?.firm?.logo_url ? (
                          <img
                            src={job.firm.logo_url}
                            alt={`${job.firm.name} logo`}
                            className="h-12 w-12 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-1.5 opacity-60"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-300 text-neutral-500 dark:bg-neutral-700">
                            <span className="text-lg font-bold">
                              {job?.firm?.name?.charAt(0).toUpperCase() || 'J'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                              {job?.title}
                            </p>
                            <p className="mt-1 text-neutral-500">
                              {job?.firm?.name}
                            </p>
                          </div>

                          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {status.label}
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-neutral-500">
                          Applied {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
