import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { JobForm } from '../job-form'
import { getRecruiterProfile } from '../actions'

export default async function NewJobPage() {
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
    redirect('/recruiter/jobs')
  }

  if (!recruiterProfile.firm_id) {
    redirect('/recruiter/jobs')
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
        <h1 className="mt-4 text-3xl font-bold">Post a New Job</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Create a job listing for {recruiterProfile.firm_name}
        </p>
      </div>

      <JobForm mode="create" />
    </div>
  )
}
