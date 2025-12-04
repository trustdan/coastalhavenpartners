import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase, Eye, Users, Clock, CheckCircle2, Pause, XCircle, FileEdit } from 'lucide-react'
import { getJobListings, getRecruiterProfile } from './actions'
import { JobStatusBadge } from './job-status-badge'
import { JobActionsMenu } from './job-actions-menu'
import type { Database } from '@/lib/types/database.types'

export default async function RecruiterJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const recruiterProfile = await getRecruiterProfile()

  if (!recruiterProfile) {
    redirect('/complete-profile/recruiter')
  }

  if (!recruiterProfile.is_approved) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Post and manage job listings for your firm
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-8 text-center dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <Clock className="mx-auto h-12 w-12 text-yellow-600" />
          <h2 className="mt-4 text-xl font-semibold text-yellow-800 dark:text-yellow-200">
            Verification Required
          </h2>
          <p className="mt-2 text-yellow-700 dark:text-yellow-300">
            Your account must be verified before you can post job listings.
            Our team is reviewing your profile.
          </p>
        </div>
      </div>
    )
  }

  if (!recruiterProfile.firm_id) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Post and manage job listings for your firm
          </p>
        </div>

        <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
          <Briefcase className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-xl font-semibold">No Firm Associated</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Please contact support to link your profile to a firm.
          </p>
        </div>
      </div>
    )
  }

  const jobs = await getJobListings()

  const activeJobs = jobs.filter(j => j.status === 'active')
  const draftJobs = jobs.filter(j => j.status === 'draft')
  const closedJobs = jobs.filter(j => ['closed', 'filled', 'paused'].includes(j.status))

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted for {recruiterProfile.firm_name}
          </p>
        </div>
        <Button asChild>
          <Link href="/recruiter/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeJobs.length}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <FileEdit className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{draftJobs.length}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Drafts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {jobs.reduce((sum, j) => sum + (j.application_count || 0), 0)}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Applications</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {jobs.reduce((sum, j) => sum + (j.view_count || 0), 0)}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {jobs.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <Briefcase className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-xl font-semibold">No job listings yet</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Post your first job to start receiving applications from qualified candidates.
          </p>
          <Button asChild className="mt-6">
            <Link href="/recruiter/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Job
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="text-lg font-semibold hover:text-blue-600 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <JobStatusBadge status={job.status} />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                    {job.locations && job.locations.length > 0 && (
                      <span>{job.locations.join(', ')}</span>
                    )}
                    {job.application_deadline && (
                      <span>
                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <Link
                      href={`/recruiter/jobs/${job.id}/applications`}
                      className="flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Users className="h-4 w-4" />
                      {job.application_count || 0} application{(job.application_count || 0) !== 1 ? 's' : ''}
                    </Link>
                    <span className="flex items-center gap-1.5 text-neutral-500">
                      <Eye className="h-4 w-4" />
                      {job.view_count || 0} view{(job.view_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <JobActionsMenu job={job} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
