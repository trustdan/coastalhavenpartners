import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, MapPin, Clock, Calendar, Star, Building2 } from 'lucide-react'
import { getActiveJobListings, getCandidateProfile, type JobFilters } from './actions'
import { JobFiltersComponent } from './job-filters'
import type { Database } from '@/lib/types/database.types'

type JobType = Database['public']['Enums']['job_type']

const jobTypeLabels: Record<JobType, string> = {
  full_time: 'Full Time',
  internship: 'Internship',
  summer_analyst: 'Summer Analyst',
  off_cycle: 'Off-Cycle',
}

interface CandidateJobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CandidateJobsPage({ searchParams }: CandidateJobsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const candidateProfile = await getCandidateProfile()

  if (!candidateProfile) {
    redirect('/candidate')
  }

  const params = await searchParams
  const filters: JobFilters = {
    job_type: typeof params.job_type === 'string' ? params.job_type as JobType : undefined,
    location: typeof params.location === 'string' ? params.location : undefined,
    target_role: typeof params.target_role === 'string' ? params.target_role : undefined,
    search: typeof params.search === 'string' ? params.search : undefined,
  }

  const jobs = await getActiveJobListings(filters)

  const isVerified = candidateProfile.status === 'verified' || candidateProfile.status === 'active'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Job Board</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {jobs.length} open position{jobs.length !== 1 ? 's' : ''} from top firms
        </p>
      </div>

      {!isVerified && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Your profile must be verified before you can apply to jobs.
            You can still browse available positions.
          </p>
        </div>
      )}

      <JobFiltersComponent filters={filters} />

      {jobs.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <Briefcase className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-xl font-semibold">No jobs found</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Try adjusting your filters or check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/candidate/jobs/${job.slug}`}
              className="block rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:bg-neutral-900 dark:hover:border-blue-800"
            >
              <div className="flex items-start gap-4">
                {/* Firm Logo */}
                <div className="flex-shrink-0">
                  {job.firm?.logo_url ? (
                    <img
                      src={job.firm.logo_url}
                      alt={`${job.firm.name} logo`}
                      className="h-14 w-14 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-2"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <span className="text-xl font-bold">
                        {job.firm?.name?.charAt(0).toUpperCase() || 'J'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold hover:text-blue-600">
                          {job.title}
                        </h2>
                        {job.is_featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        {job.firm?.name}
                      </p>
                    </div>

                    <span className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                      {jobTypeLabels[job.job_type]}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {job.locations && job.locations.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.locations.slice(0, 2).join(', ')}
                        {job.locations.length > 2 && ` +${job.locations.length - 2}`}
                      </span>
                    )}
                    {job.application_deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    )}
                    {job.compensation_range && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        {job.compensation_range}
                      </span>
                    )}
                  </div>

                  {/* Target Roles */}
                  {job.target_roles && job.target_roles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.target_roles.slice(0, 3).map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {role}
                        </span>
                      ))}
                      {job.target_roles.length > 3 && (
                        <span className="text-xs text-neutral-500">
                          +{job.target_roles.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
