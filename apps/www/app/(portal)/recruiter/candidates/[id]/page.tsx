import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CandidateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify recruiter access
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('is_approved, firm_name')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    redirect('/recruiter')
  }

  // Fetch candidate details
  const { data: candidate, error } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        linkedin_url,
        phone
      )
    `)
    .eq('id', id)
    .single()

  if (error || !candidate) {
    return (
      <div className="container py-8">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
          <h1 className="text-2xl font-bold">Candidate Not Found</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            This candidate may have been removed or is no longer verified.
          </p>
          <Button asChild className="mt-4">
            <Link href="/recruiter">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Track Profile View
  const { trackEventServer } = await import('@/lib/analytics')
  await trackEventServer('profile_view', {
    recruiter_firm: recruiterProfile.firm_name
  }, candidate.user_id || undefined)

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="gap-2 pl-0">
        <Link href="/recruiter">
          <ArrowLeft className="h-4 w-4" />
          Back to Candidates
        </Link>
      </Button>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{candidate.profiles?.full_name}</h1>
          <div className="mt-2 flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
            <span>{candidate.school_name}</span>
            <span>•</span>
            <span>Class of {candidate.graduation_year}</span>
            {candidate.profiles?.linkedin_url && (
              <>
                <span>•</span>
                <a 
                  href={candidate.profiles.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Contact</Button>
          <Button>Schedule Interview</Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Academic Stats */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold">Academic Performance</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA</p>
                <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">
                  {candidate.gpa.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Major</p>
                <p className="mt-1 text-lg font-semibold">{candidate.major}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Education</p>
                <p className="mt-1 text-lg font-semibold capitalize">
                  {candidate.education_level || 'Bachelors'}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold">Documents</h2>
            <div className="mt-4 space-y-4">
              {candidate.resume_url ? (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-red-100 p-2 text-red-600 dark:bg-red-900/20">
                      PDF
                    </div>
                    <div>
                      <p className="font-medium">Resume</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Uploaded on {candidate.updated_at ? new Date(candidate.updated_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">View</a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">No resume uploaded yet.</p>
              )}

              {candidate.transcript_url ? (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/20">
                      PDF
                    </div>
                    <div>
                      <p className="font-medium">Transcript</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Uploaded on {candidate.updated_at ? new Date(candidate.updated_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.transcript_url} target="_blank" rel="noopener noreferrer">View</a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">No transcript uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Contact Info */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
                <a href={`mailto:${candidate.profiles?.email}`} className="font-medium hover:underline">
                  {candidate.profiles?.email}
                </a>
              </div>
              {candidate.profiles?.phone && (
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
                  <a href={`tel:${candidate.profiles.phone}`} className="font-medium hover:underline">
                    {candidate.profiles.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold">Preferences</h2>
            
            <div className="mt-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Target Roles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {candidate.target_roles?.map((role) => (
                  <span key={role} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    {role}
                  </span>
                )) || <span className="text-sm text-neutral-500">Not specified</span>}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Preferred Locations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {candidate.preferred_locations?.map((loc) => (
                  <span key={loc} className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {loc}
                  </span>
                )) || <span className="text-sm text-neutral-500">Not specified</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
