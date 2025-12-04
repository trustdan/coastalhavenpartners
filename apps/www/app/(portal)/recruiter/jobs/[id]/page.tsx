import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { JobForm } from '../job-form'
import { getJobListing, getRecruiterProfile } from '../actions'
import { JobStatusBadge } from '../job-status-badge'

interface EditJobPageProps {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: EditJobPageProps) {
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
          <h1 className="text-3xl font-bold">Edit Job</h1>
          <JobStatusBadge status={job.status} />
        </div>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Update the details for "{job.title}"
        </p>
      </div>

      <JobForm job={job} mode="edit" />
    </div>
  )
}
