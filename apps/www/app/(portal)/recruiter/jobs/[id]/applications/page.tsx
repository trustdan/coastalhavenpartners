import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Users, Clock, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'
import { getJobListing, getJobApplications, getRecruiterProfile } from '../../actions'
import { JobStatusBadge } from '../../job-status-badge'
import { ApplicationStatusSelect } from './application-status-select'
import type { Database } from '@/lib/types/database.types'

interface JobApplicationsPageProps {
  params: Promise<{ id: string }>
}

type ApplicationStatus = Database['public']['Enums']['application_status']

const statusConfig: Record<ApplicationStatus, { icon: typeof Clock; color: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600' },
  reviewing: { icon: MessageSquare, color: 'text-blue-600' },
  interviewed: { icon: Users, color: 'text-purple-600' },
  accepted: { icon: CheckCircle2, color: 'text-green-600' },
  rejected: { icon: XCircle, color: 'text-red-600' },
  withdrawn: { icon: XCircle, color: 'text-neutral-400' },
}

export default async function JobApplicationsPage({ params }: JobApplicationsPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const recruiterProfile = await getRecruiterProfile()

  if (!recruiterProfile) {
    redirect('/complete-profile/recruiter')
  }

  const job = await getJobListing(id)

  if (!job) {
    notFound()
  }

  const applications = await getJobApplications(id)

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <JobStatusBadge status={job.status} />
        </div>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {applications.length} application{applications.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <Users className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-xl font-semibold">No applications yet</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Applications will appear here once candidates start applying.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Candidate</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Education</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Applied</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((app: any) => {
                const StatusIcon = statusConfig[app.status as ApplicationStatus].icon
                const statusColor = statusConfig[app.status as ApplicationStatus].color

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {app.candidate_profiles?.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {app.candidate_profiles?.profiles?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p>{app.candidate_profiles?.school_name}</p>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {app.candidate_profiles?.major}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {app.candidate_profiles?.gpa?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                        <span className="capitalize text-sm">{app.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ApplicationStatusSelect
                          applicationId={app.id}
                          currentStatus={app.status}
                        />
                        <Link
                          href={`/recruiter/candidates/${app.candidate_profiles?.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cover Letters Section */}
      {applications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cover Letters</h2>
          {applications.map((app: any) => (
            <div
              key={app.id}
              className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">
                    {app.candidate_profiles?.profiles?.full_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="capitalize text-sm text-neutral-600">{app.status}</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                  {app.cover_letter}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
