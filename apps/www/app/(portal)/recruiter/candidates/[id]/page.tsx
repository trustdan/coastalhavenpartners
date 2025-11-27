import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar, GraduationCap } from 'lucide-react'

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
      profiles!user_id (
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
          <Button variant="outline" asChild>
            <a href={`mailto:${candidate.profiles?.email}`} className="gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </a>
          </Button>
          {(candidate as any).scheduling_url ? (
            <Button asChild>
              <a
                href={(candidate as any).scheduling_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule Interview
              </a>
            </Button>
          ) : (
            <Button disabled className="gap-2">
              <Calendar className="h-4 w-4" />
              No Scheduling Link
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Education Section */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="text-lg font-semibold mb-4">Education</h2>

            {/* Undergraduate Education */}
            <div className="rounded-lg border p-4 bg-purple-50/50 dark:bg-purple-900/10">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-300">Undergraduate</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">School</p>
                  <p className="font-medium">{candidate.school_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Degree</p>
                  <p className="font-medium">
                    {(candidate as any).undergrad_degree_type || 'BS'} in {candidate.major}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA</p>
                  <p className="font-bold text-green-700 dark:text-green-400">{candidate.gpa.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Class of</p>
                  <p className="font-medium">{candidate.graduation_year}</p>
                </div>
                {(candidate as any).undergrad_specialty && (
                  <div className="col-span-2">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Concentration</p>
                    <p className="font-medium">{(candidate as any).undergrad_specialty}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Graduate Education (if exists) */}
            {((candidate as any).grad_school || (candidate as any).grad_degree_type) && (
              <div className="rounded-lg border p-4 bg-blue-50/50 dark:bg-blue-900/10 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300">Graduate</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(candidate as any).grad_school && (
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">School</p>
                      <p className="font-medium">{(candidate as any).grad_school}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Degree</p>
                    <p className="font-medium">
                      {(candidate as any).grad_degree_type}
                      {(candidate as any).grad_major && ` in ${(candidate as any).grad_major}`}
                    </p>
                  </div>
                  {(candidate as any).grad_gpa && (
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA</p>
                      <p className="font-bold text-green-700 dark:text-green-400">
                        {parseFloat((candidate as any).grad_gpa).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {(candidate as any).grad_graduation_year && (
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Class of</p>
                      <p className="font-medium">{(candidate as any).grad_graduation_year}</p>
                    </div>
                  )}
                  {(candidate as any).grad_specialty && (
                    <div className="col-span-2">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Concentration</p>
                      <p className="font-medium">{(candidate as any).grad_specialty}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* About / Bio */}
          {(candidate as any).bio && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-4 text-neutral-700 dark:text-neutral-300">
                {(candidate as any).bio}
              </p>
            </div>
          )}

          {/* Skills & Interests */}
          {candidate.tags && candidate.tags.length > 0 && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
              <h2 className="text-lg font-semibold">Skills & Interests</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {candidate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

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
