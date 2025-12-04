import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, Calendar, Clock, Building2, ExternalLink, Briefcase, GraduationCap, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getJobBySlug, getCandidateProfile, hasAppliedToJob, getCandidateResumes } from '../actions'
import { ApplyButton } from './apply-button'
import type { Database } from '@/lib/types/database.types'

type JobType = Database['public']['Enums']['job_type']

const jobTypeLabels: Record<JobType, string> = {
  full_time: 'Full Time',
  internship: 'Internship',
  summer_analyst: 'Summer Analyst',
  off_cycle: 'Off-Cycle',
}

interface JobDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [job, candidateProfile] = await Promise.all([
    getJobBySlug(slug),
    getCandidateProfile(),
  ])

  if (!job) {
    notFound()
  }

  if (!candidateProfile) {
    redirect('/candidate')
  }

  const isVerified = candidateProfile.status === 'verified' || candidateProfile.status === 'active'
  const hasApplied = await hasAppliedToJob(job.id)
  const rawResumes = isVerified ? await getCandidateResumes() : []
  // Map to ensure is_default is boolean (not null)
  const resumes = rawResumes.map(r => ({
    ...r,
    is_default: r.is_default ?? false,
  }))

  const isDeadlinePassed = job.application_deadline
    ? new Date(job.application_deadline) < new Date()
    : false

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/candidate/jobs"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <div className="flex items-start gap-4">
              {job.firm?.logo_url ? (
                <img
                  src={job.firm.logo_url}
                  alt={`${job.firm.name} logo`}
                  className="h-16 w-16 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-2"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <span className="text-2xl font-bold">
                    {job.firm?.name?.charAt(0).toUpperCase() || 'J'}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
                  {job.firm?.name}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {jobTypeLabels[job.job_type]}
                  </span>
                  {job.locations && job.locations.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.locations.join(', ')}
                    </span>
                  )}
                  {job.compensation_range && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <DollarSign className="h-4 w-4" />
                      {job.compensation_range}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold mb-4">About this Role</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
              <h2 className="text-lg font-semibold mb-4">Requirements</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
              <h2 className="text-lg font-semibold mb-4">Responsibilities</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.responsibilities}</p>
              </div>
            </div>
          )}

          {/* Application Instructions */}
          {job.application_instructions && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
              <h2 className="text-lg font-semibold mb-4">How to Apply</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.application_instructions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold mb-4">Apply Now</h2>

            {hasApplied ? (
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  You've already applied to this position
                </p>
                <Link
                  href="/candidate/my-applications"
                  className="mt-2 inline-block text-sm text-green-600 hover:underline"
                >
                  View your applications
                </Link>
              </div>
            ) : isDeadlinePassed ? (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Application deadline has passed
                </p>
              </div>
            ) : !isVerified ? (
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Your profile must be verified before you can apply.
                </p>
                <Link
                  href="/candidate"
                  className="mt-2 inline-block text-sm font-medium text-yellow-800 hover:underline dark:text-yellow-200"
                >
                  Check verification status
                </Link>
              </div>
            ) : job.external_url ? (
              <div className="space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This position requires applying through the firm's website.
                </p>
                <Button asChild className="w-full">
                  <a href={job.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Apply on Company Site
                  </a>
                </Button>
              </div>
            ) : (
              <ApplyButton jobId={job.id} resumes={resumes} />
            )}

            {/* Key Details */}
            <div className="mt-6 space-y-3 border-t pt-6">
              {job.application_deadline && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Deadline</span>
                  <span className={`font-medium ${isDeadlinePassed ? 'text-red-600' : ''}`}>
                    {new Date(job.application_deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              {job.start_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Start Date</span>
                  <span className="font-medium">
                    {new Date(job.start_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {job.target_grad_years && job.target_grad_years.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Class of</span>
                  <span className="font-medium">
                    {job.target_grad_years.join(', ')}
                  </span>
                </div>
              )}
              {job.min_gpa && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Min GPA</span>
                  <span className="font-medium">{Number(job.min_gpa).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Firm Info */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold mb-4">About {job.firm?.name}</h2>

            {job.firm?.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {job.firm.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              {job.firm?.firm_type && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-neutral-400" />
                  <span>{job.firm.firm_type}</span>
                </div>
              )}
              {job.firm?.locations && job.firm.locations.length > 0 && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span>{job.firm.locations.join(', ')}</span>
                </div>
              )}
              {job.firm?.website && (
                <a
                  href={job.firm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </a>
              )}
            </div>

            <Link
              href={`/firms/${job.firm?.slug}`}
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              View Full Firm Profile
            </Link>
          </div>

          {/* Target Roles */}
          {job.target_roles && job.target_roles.length > 0 && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
              <h2 className="text-lg font-semibold mb-4">Target Roles</h2>
              <div className="flex flex-wrap gap-2">
                {job.target_roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
